# backend/statistiques/services.py
# Services de calcul des statistiques

from django.db.models import Sum, Count, Avg, Q, F
from django.db.models.functions import TruncMonth, TruncWeek, TruncDay
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from users.models import User
from vehicules.models import Vehicule, Marque, Categorie
from concessions.models import Concession
from locations.models import Location
from demands.models import DemandeContact
from avis.models import Avis
from favoris.models import Favori, Historique
from promotions.models import Promotion, UtilisationPromotion


# ========================================
# SERVICE STATISTIQUES CONCESSIONNAIRE
# ========================================

class StatistiquesConcessionnaire:
    """
    Service pour calculer les statistiques d'un concessionnaire.
    """
    
    def __init__(self, concessionnaire):
        self.concessionnaire = concessionnaire
        self.today = timezone.now().date()
    
    def get_statistiques_completes(self):
        """Retourner toutes les statistiques."""
        return {
            'revenus': self.get_revenus(),
            'locations': self.get_locations(),
            'vehicules': self.get_vehicules(),
            'demandes': self.get_demandes(),
            'avis': self.get_avis(),
            'promotions': self.get_promotions(),
            'tendances': self.get_tendances(),
        }
    
    def get_revenus(self):
        """Calculer les statistiques de revenus."""
        locations = Location.objects.filter(
            concessionnaire=self.concessionnaire,
            statut='TERMINEE'
        )
        
        # Ce mois
        debut_mois = self.today.replace(day=1)
        locations_mois = locations.filter(date_retour_reel__date__gte=debut_mois)
        revenu_mois = locations_mois.aggregate(
            total=Sum('prix_total')
        )['total'] or Decimal('0')
        
        # Mois précédent
        debut_mois_precedent = (debut_mois - timedelta(days=1)).replace(day=1)
        fin_mois_precedent = debut_mois - timedelta(days=1)
        locations_mois_precedent = locations.filter(
            date_retour_reel__date__gte=debut_mois_precedent,
            date_retour_reel__date__lte=fin_mois_precedent
        )
        revenu_mois_precedent = locations_mois_precedent.aggregate(
            total=Sum('prix_total')
        )['total'] or Decimal('0')
        
        # Variation
        if revenu_mois_precedent > 0:
            variation = ((revenu_mois - revenu_mois_precedent) / revenu_mois_precedent) * 100
        else:
            variation = 100 if revenu_mois > 0 else 0
        
        # Total général
        revenu_total = locations.aggregate(total=Sum('prix_total'))['total'] or Decimal('0')
        
        # Pénalités
        penalites_total = locations.aggregate(total=Sum('montant_penalite'))['total'] or Decimal('0')
        
        return {
            'revenu_mois': float(revenu_mois),
            'revenu_mois_precedent': float(revenu_mois_precedent),
            'variation_pourcentage': round(float(variation), 1),
            'revenu_total': float(revenu_total),
            'penalites_total': float(penalites_total),
        }
    
    def get_locations(self):
        """Calculer les statistiques de locations."""
        locations = Location.objects.filter(concessionnaire=self.concessionnaire)
        
        total = locations.count()
        en_cours = locations.filter(statut='EN_COURS').count()
        confirmees = locations.filter(statut='CONFIRMEE').count()
        terminees = locations.filter(statut='TERMINEE').count()
        annulees = locations.filter(statut='ANNULEE').count()
        demandes = locations.filter(statut='DEMANDE').count()
        
        # Ce mois
        debut_mois = self.today.replace(day=1)
        locations_mois = locations.filter(date_creation__date__gte=debut_mois).count()
        
        # Durée moyenne
        duree_moyenne = locations.filter(statut='TERMINEE').aggregate(
            moyenne=Avg('nombre_jours')
        )['moyenne'] or 0
        
        # Taux de conversion (demandes -> confirmées/terminées)
        total_demandes = locations.count()
        total_reussies = locations.filter(statut__in=['CONFIRMEE', 'EN_COURS', 'TERMINEE']).count()
        taux_conversion = (total_reussies / total_demandes * 100) if total_demandes > 0 else 0
        
        return {
            'total': total,
            'en_cours': en_cours,
            'confirmees': confirmees,
            'terminees': terminees,
            'annulees': annulees,
            'en_attente': demandes,
            'ce_mois': locations_mois,
            'duree_moyenne_jours': round(duree_moyenne, 1),
            'taux_conversion': round(taux_conversion, 1),
        }
    
    def get_vehicules(self):
        """Calculer les statistiques des véhicules."""
        vehicules = Vehicule.objects.filter(concessionnaire=self.concessionnaire)
        
        total = vehicules.count()
        disponibles = vehicules.filter(statut='DISPONIBLE').count()
        loues = vehicules.filter(statut='LOUE').count()
        maintenance = vehicules.filter(statut='MAINTENANCE').count()
        indisponibles = vehicules.filter(statut='INDISPONIBLE').count()
        
        # Note moyenne
        note_moyenne = vehicules.aggregate(moyenne=Avg('note_moyenne'))['moyenne'] or 0
        
        # Top 5 véhicules les plus loués
        top_vehicules = vehicules.order_by('-nombre_locations')[:5].values(
            'id', 'nom_modele', 'nombre_locations', 'note_moyenne'
        )
        
        # Taux d'occupation
        taux_occupation = (loues / total * 100) if total > 0 else 0
        
        return {
            'total': total,
            'disponibles': disponibles,
            'loues': loues,
            'maintenance': maintenance,
            'indisponibles': indisponibles,
            'note_moyenne': round(float(note_moyenne), 2),
            'taux_occupation': round(taux_occupation, 1),
            'top_vehicules': list(top_vehicules),
        }
    
    def get_demandes(self):
        """Calculer les statistiques des demandes."""
        demandes = DemandeContact.objects.filter(concessionnaire=self.concessionnaire)
        
        total = demandes.count()
        en_attente = demandes.filter(statut='EN_ATTENTE').count()
        en_cours = demandes.filter(statut='EN_COURS').count()
        traitees = demandes.filter(statut='TRAITEE').count()
        
        # Ce mois
        debut_mois = self.today.replace(day=1)
        demandes_mois = demandes.filter(date_creation__date__gte=debut_mois).count()
        
        # Par type
        par_type = demandes.values('type_demande').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Délai moyen de réponse (en heures)
        demandes_traitees = demandes.filter(
            statut='TRAITEE',
            date_reponse__isnull=False
        )
        
        delai_moyen = 0
        if demandes_traitees.exists():
            from django.db.models import ExpressionWrapper, DurationField
            # Calcul simplifié
            total_heures = 0
            count = 0
            for d in demandes_traitees[:100]:  # Limiter pour performance
                if d.date_reponse and d.date_creation:
                    delta = d.date_reponse - d.date_creation
                    total_heures += delta.total_seconds() / 3600
                    count += 1
            if count > 0:
                delai_moyen = total_heures / count
        
        return {
            'total': total,
            'en_attente': en_attente,
            'en_cours': en_cours,
            'traitees': traitees,
            'ce_mois': demandes_mois,
            'par_type': list(par_type),
            'delai_moyen_heures': round(delai_moyen, 1),
        }
    
    def get_avis(self):
        """Calculer les statistiques des avis."""
        avis = Avis.objects.filter(vehicule__concessionnaire=self.concessionnaire)
        
        total = avis.count()
        note_moyenne = avis.aggregate(moyenne=Avg('note'))['moyenne'] or 0
        
        # Répartition par note
        par_note = avis.values('note').annotate(count=Count('id')).order_by('note')
        
        # Avis en attente de réponse
        sans_reponse = avis.filter(reponse='').count()
        
        # Ce mois
        debut_mois = self.today.replace(day=1)
        avis_mois = avis.filter(date_creation__date__gte=debut_mois).count()
        
        # Taux de recommandation
        recommandes = avis.filter(recommande=True).count()
        taux_recommandation = (recommandes / total * 100) if total > 0 else 0
        
        return {
            'total': total,
            'note_moyenne': round(float(note_moyenne), 2),
            'par_note': list(par_note),
            'sans_reponse': sans_reponse,
            'ce_mois': avis_mois,
            'taux_recommandation': round(taux_recommandation, 1),
        }
    
    def get_promotions(self):
        """Calculer les statistiques des promotions."""
        promotions = Promotion.objects.filter(concessionnaire=self.concessionnaire)
        utilisations = UtilisationPromotion.objects.filter(
            promotion__concessionnaire=self.concessionnaire
        )
        
        total = promotions.count()
        actives = promotions.filter(statut='ACTIF').count()
        
        # Total des réductions accordées
        total_reductions = utilisations.aggregate(
            total=Sum('montant_reduction')
        )['total'] or Decimal('0')
        
        # Nombre d'utilisations
        nb_utilisations = utilisations.count()
        
        return {
            'total': total,
            'actives': actives,
            'nb_utilisations': nb_utilisations,
            'total_reductions': float(total_reductions),
        }
    
    def get_tendances(self):
        """Calculer les tendances (6 derniers mois)."""
        locations = Location.objects.filter(
            concessionnaire=self.concessionnaire,
            statut='TERMINEE'
        )
        
        # Revenus par mois
        revenus_par_mois = locations.annotate(
            mois=TruncMonth('date_retour_reel')
        ).values('mois').annotate(
            total=Sum('prix_total'),
            count=Count('id')
        ).order_by('-mois')[:6]
        
        # Locations par mois
        locations_par_mois = Location.objects.filter(
            concessionnaire=self.concessionnaire
        ).annotate(
            mois=TruncMonth('date_creation')
        ).values('mois').annotate(
            count=Count('id')
        ).order_by('-mois')[:6]
        
        return {
            'revenus_par_mois': list(revenus_par_mois),
            'locations_par_mois': list(locations_par_mois),
        }


# ========================================
# SERVICE STATISTIQUES CLIENT
# ========================================

class StatistiquesClient:
    """
    Service pour calculer les statistiques d'un client.
    """
    
    def __init__(self, client):
        self.client = client
        self.today = timezone.now().date()
    
    def get_statistiques_completes(self):
        """Retourner toutes les statistiques."""
        return {
            'locations': self.get_locations(),
            'depenses': self.get_depenses(),
            'favoris': self.get_favoris(),
            'avis': self.get_avis(),
            'activite': self.get_activite(),
        }
    
    def get_locations(self):
        """Statistiques des locations du client."""
        locations = Location.objects.filter(client=self.client)
        
        total = locations.count()
        en_cours = locations.filter(statut='EN_COURS').count()
        terminees = locations.filter(statut='TERMINEE').count()
        annulees = locations.filter(statut='ANNULEE').count()
        
        # Prochaine location
        prochaine = locations.filter(
            statut='CONFIRMEE',
            date_debut__gte=self.today
        ).order_by('date_debut').first()
        
        prochaine_info = None
        if prochaine:
            prochaine_info = {
                'id': prochaine.id,
                'vehicule': prochaine.vehicule.nom_complet,
                'date_debut': prochaine.date_debut.isoformat(),
            }
        
        return {
            'total': total,
            'en_cours': en_cours,
            'terminees': terminees,
            'annulees': annulees,
            'prochaine_location': prochaine_info,
        }
    
    def get_depenses(self):
        """Statistiques des dépenses du client."""
        locations = Location.objects.filter(
            client=self.client,
            statut='TERMINEE'
        )
        
        # Total dépensé
        total = locations.aggregate(total=Sum('prix_total'))['total'] or Decimal('0')
        
        # Ce mois
        debut_mois = self.today.replace(day=1)
        depenses_mois = locations.filter(
            date_retour_reel__date__gte=debut_mois
        ).aggregate(total=Sum('prix_total'))['total'] or Decimal('0')
        
        # Économies (promotions)
        economies = locations.aggregate(
            total=Sum('montant_reduction')
        )['total'] or Decimal('0')
        
        # Panier moyen
        nb_locations = locations.count()
        panier_moyen = total / nb_locations if nb_locations > 0 else Decimal('0')
        
        return {
            'total': float(total),
            'ce_mois': float(depenses_mois),
            'economies': float(economies),
            'panier_moyen': float(panier_moyen),
        }
    
    def get_favoris(self):
        """Statistiques des favoris du client."""
        favoris = Favori.objects.filter(client=self.client)
        
        total = favoris.count()
        avec_alerte = favoris.filter(alerte_prix_active=True).count()
        
        # Favoris avec baisse de prix
        baisses = 0
        for favori in favoris.filter(alerte_prix_active=True):
            if favori.verifier_baisse_prix():
                baisses += 1
        
        return {
            'total': total,
            'avec_alerte': avec_alerte,
            'baisses_detectees': baisses,
        }
    
    def get_avis(self):
        """Statistiques des avis du client."""
        avis = Avis.objects.filter(client=self.client)
        
        total = avis.count()
        note_moyenne_donnee = avis.aggregate(moyenne=Avg('note'))['moyenne'] or 0
        
        # Avis avec réponse
        avec_reponse = avis.exclude(reponse='').count()
        
        return {
            'total': total,
            'note_moyenne_donnee': round(float(note_moyenne_donnee), 2),
            'avec_reponse': avec_reponse,
        }
    
    def get_activite(self):
        """Statistiques d'activité du client."""
        historique = Historique.objects.filter(utilisateur=self.client)
        
        # Actions récentes (7 derniers jours)
        date_limite = timezone.now() - timedelta(days=7)
        actions_recentes = historique.filter(date_action__gte=date_limite).count()
        
        # Véhicules consultés
        vehicules_consultes = historique.filter(
            type_action='CONSULTATION_VEHICULE'
        ).values('vehicule').distinct().count()
        
        return {
            'actions_7_derniers_jours': actions_recentes,
            'vehicules_consultes': vehicules_consultes,
        }


# ========================================
# SERVICE STATISTIQUES ADMINISTRATEUR
# ========================================

class StatistiquesAdmin:
    """
    Service pour calculer les statistiques globales de la plateforme.
    """
    
    def __init__(self):
        self.today = timezone.now().date()
    
    def get_statistiques_completes(self):
        """Retourner toutes les statistiques globales."""
        return {
            'utilisateurs': self.get_utilisateurs(),
            'concessions': self.get_concessions(),
            'vehicules': self.get_vehicules(),
            'locations': self.get_locations(),
            'revenus': self.get_revenus(),
            'demandes': self.get_demandes(),
            'tendances': self.get_tendances(),
        }
    
    def get_utilisateurs(self):
        """Statistiques des utilisateurs."""
        users = User.objects.all()
        
        total = users.count()
        clients = users.filter(type_utilisateur='CLIENT').count()
        concessionnaires = users.filter(type_utilisateur='CONCESSIONNAIRE').count()
        admins = users.filter(type_utilisateur='ADMINISTRATEUR').count()
        
        # Nouveaux ce mois
        debut_mois = self.today.replace(day=1)
        nouveaux_mois = users.filter(date_inscription__date__gte=debut_mois).count()
        
        # Actifs (connectés dans les 30 derniers jours)
        date_limite = timezone.now() - timedelta(days=30)
        actifs = users.filter(derniere_connexion__gte=date_limite).count()
        
        # Concessionnaires en attente de validation
        en_attente_validation = users.filter(
            type_utilisateur='CONCESSIONNAIRE',
            est_valide=False
        ).count()
        
        return {
            'total': total,
            'clients': clients,
            'concessionnaires': concessionnaires,
            'admins': admins,
            'nouveaux_ce_mois': nouveaux_mois,
            'actifs_30_jours': actifs,
            'concessionnaires_en_attente': en_attente_validation,
        }
    
    def get_concessions(self):
        """Statistiques des concessions."""
        concessions = Concession.objects.all()
        
        total = concessions.count()
        validees = concessions.filter(statut='VALIDE').count()
        en_attente = concessions.filter(statut='EN_ATTENTE').count()
        suspendues = concessions.filter(statut='SUSPENDUE').count()
        
        # Par région
        par_region = concessions.filter(statut='VALIDE').values(
            'region__nom'
        ).annotate(count=Count('id')).order_by('-count')[:10]
        
        return {
            'total': total,
            'validees': validees,
            'en_attente': en_attente,
            'suspendues': suspendues,
            'par_region': list(par_region),
        }
    
    def get_vehicules(self):
        """Statistiques des véhicules."""
        vehicules = Vehicule.objects.all()
        
        total = vehicules.count()
        disponibles = vehicules.filter(statut='DISPONIBLE').count()
        loues = vehicules.filter(statut='LOUE').count()
        
        # Par catégorie
        par_categorie = vehicules.values(
            'categorie__nom'
        ).annotate(count=Count('id')).order_by('-count')[:10]
        
        # Par marque
        par_marque = vehicules.values(
            'marque__nom'
        ).annotate(count=Count('id')).order_by('-count')[:10]
        
        # Note moyenne globale
        note_moyenne = vehicules.aggregate(moyenne=Avg('note_moyenne'))['moyenne'] or 0
        
        return {
            'total': total,
            'disponibles': disponibles,
            'loues': loues,
            'par_categorie': list(par_categorie),
            'par_marque': list(par_marque),
            'note_moyenne_globale': round(float(note_moyenne), 2),
        }
    
    def get_locations(self):
        """Statistiques des locations."""
        locations = Location.objects.all()
        
        total = locations.count()
        en_cours = locations.filter(statut='EN_COURS').count()
        terminees = locations.filter(statut='TERMINEE').count()
        
        # Ce mois
        debut_mois = self.today.replace(day=1)
        ce_mois = locations.filter(date_creation__date__gte=debut_mois).count()
        
        # Taux de réussite global
        total_hors_demande = locations.exclude(statut='DEMANDE').count()
        reussies = locations.filter(statut__in=['CONFIRMEE', 'EN_COURS', 'TERMINEE']).count()
        taux_reussite = (reussies / total_hors_demande * 100) if total_hors_demande > 0 else 0
        
        return {
            'total': total,
            'en_cours': en_cours,
            'terminees': terminees,
            'ce_mois': ce_mois,
            'taux_reussite': round(taux_reussite, 1),
        }
    
    def get_revenus(self):
        """Statistiques des revenus globaux."""
        locations = Location.objects.filter(statut='TERMINEE')
        
        # Total
        total = locations.aggregate(total=Sum('prix_total'))['total'] or Decimal('0')
        
        # Ce mois
        debut_mois = self.today.replace(day=1)
        ce_mois = locations.filter(
            date_retour_reel__date__gte=debut_mois
        ).aggregate(total=Sum('prix_total'))['total'] or Decimal('0')
        
        # Mois précédent
        debut_mois_precedent = (debut_mois - timedelta(days=1)).replace(day=1)
        fin_mois_precedent = debut_mois - timedelta(days=1)
        mois_precedent = locations.filter(
            date_retour_reel__date__gte=debut_mois_precedent,
            date_retour_reel__date__lte=fin_mois_precedent
        ).aggregate(total=Sum('prix_total'))['total'] or Decimal('0')
        
        # Variation
        if mois_precedent > 0:
            variation = ((ce_mois - mois_precedent) / mois_precedent) * 100
        else:
            variation = 100 if ce_mois > 0 else 0
        
        return {
            'total': float(total),
            'ce_mois': float(ce_mois),
            'mois_precedent': float(mois_precedent),
            'variation_pourcentage': round(float(variation), 1),
        }
    
    def get_demandes(self):
        """Statistiques des demandes."""
        demandes = DemandeContact.objects.all()
        
        total = demandes.count()
        en_attente = demandes.filter(statut='EN_ATTENTE').count()
        traitees = demandes.filter(statut='TRAITEE').count()
        
        # Ce mois
        debut_mois = self.today.replace(day=1)
        ce_mois = demandes.filter(date_creation__date__gte=debut_mois).count()
        
        return {
            'total': total,
            'en_attente': en_attente,
            'traitees': traitees,
            'ce_mois': ce_mois,
        }
    
    def get_tendances(self):
        """Tendances globales (6 derniers mois)."""
        # Inscriptions par mois
        inscriptions = User.objects.annotate(
            mois=TruncMonth('date_inscription')
        ).values('mois').annotate(count=Count('id')).order_by('-mois')[:6]
        
        # Locations par mois
        locations = Location.objects.annotate(
            mois=TruncMonth('date_creation')
        ).values('mois').annotate(count=Count('id')).order_by('-mois')[:6]
        
        # Revenus par mois
        revenus = Location.objects.filter(statut='TERMINEE').annotate(
            mois=TruncMonth('date_retour_reel')
        ).values('mois').annotate(total=Sum('prix_total')).order_by('-mois')[:6]
        
        return {
            'inscriptions_par_mois': list(inscriptions),
            'locations_par_mois': list(locations),
            'revenus_par_mois': list(revenus),
        }