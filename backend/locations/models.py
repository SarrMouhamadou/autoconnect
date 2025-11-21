# backend/locations/models.py
# Modèles pour le système de location

from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from users.models import User
from vehicules.models import Vehicule
from concessions.models import Concession
from decimal import Decimal
import uuid


# ========================================
# MODÈLE LOCATION
# ========================================

class Location(models.Model):
    """
    Modèle représentant une location de véhicule.
    Relation Many-to-One avec Client, Vehicule, Concessionnaire, Concession.
    ⭐ CONFORME AU DIAGRAMME DE CLASSE
    """
    
    # ========================================
    # STATUT CHOICES
    # ========================================
    
    STATUT_CHOICES = [
        ('DEMANDE', 'Demande en attente'),
        ('CONFIRMEE', 'Confirmée par le concessionnaire'),
        ('EN_COURS', 'En cours (véhicule parti)'),
        ('TERMINEE', 'Terminée (véhicule retourné)'),
        ('ANNULEE', 'Annulée'),
    ]
    
    # ========================================
    # RELATIONS
    # ========================================
    
    client = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='locations',
        limit_choices_to={'type_utilisateur': 'CLIENT'},
        verbose_name="Client"
    )
    
    vehicule = models.ForeignKey(
        Vehicule,
        on_delete=models.PROTECT,
        related_name='locations',
        verbose_name="Véhicule loué"
    )
    
    concessionnaire = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='locations_gerees',
        limit_choices_to={'type_utilisateur': 'CONCESSIONNAIRE'},
        verbose_name="Concessionnaire gestionnaire"
    )
    
    concession = models.ForeignKey(
        Concession,
        on_delete=models.PROTECT,
        related_name='locations',
        verbose_name="Concession"
    )
    
    # ========================================
    # DATES DE LOCATION
    # ========================================
    
    date_debut = models.DateField(
        verbose_name="Date de début prévue"
    )
    
    date_fin = models.DateField(
        verbose_name="Date de fin prévue"
    )
    
    date_depart_reel = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date et heure de départ réel"
    )
    
    date_retour_reel = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date et heure de retour réel"
    )
    
    # ========================================
    # TARIFICATION
    # ========================================
    
    prix_jour = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name="Prix par jour (FCFA)",
        help_text="Prix journalier au moment de la réservation"
    )
    
    nombre_jours = models.IntegerField(
        validators=[MinValueValidator(1)],
        verbose_name="Nombre de jours prévus"
    )
    
    prix_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name="Prix total (FCFA)"
    )
    
    caution = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name="Montant de la caution (FCFA)"
    )
    
    # ========================================
    # KILOMÉTRAGE
    # ========================================
    
    kilometrage_depart = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name="Kilométrage au départ"
    )
    
    kilometrage_retour = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name="Kilométrage au retour"
    )
    
    # ========================================
    # STATUT
    # ========================================
    
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='DEMANDE',
        verbose_name="Statut de la location"
    )
    
    # ========================================
    # PÉNALITÉS
    # ========================================
    
    jours_retard = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Nombre de jours de retard"
    )
    
    montant_penalite = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name="Montant des pénalités (FCFA)"
    )
    
    taux_penalite_jour = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('50.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name="Taux pénalité par jour (%)",
        help_text="Pourcentage du prix journalier appliqué en pénalité par jour de retard"
    )
    
    # ========================================
    # INFORMATIONS COMPLÉMENTAIRES
    # ========================================
    
    notes_client = models.TextField(
        blank=True,
        verbose_name="Notes du client",
        help_text="Remarques ou demandes particulières du client"
    )
    
    notes_concessionnaire = models.TextField(
        blank=True,
        verbose_name="Notes du concessionnaire",
        help_text="Notes internes du concessionnaire"
    )
    
    # État du véhicule
    etat_depart = models.TextField(
        blank=True,
        verbose_name="État du véhicule au départ",
        help_text="Description de l'état du véhicule au moment du départ"
    )
    
    etat_retour = models.TextField(
        blank=True,
        verbose_name="État du véhicule au retour",
        help_text="Description de l'état du véhicule au moment du retour"
    )
    
    # ========================================
    # MÉTADONNÉES
    # ========================================
    
    date_creation = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de création de la demande"
    )
    
    date_modification = models.DateTimeField(
        auto_now=True,
        verbose_name="Dernière modification"
    )
    
    # ========================================
    # META & MÉTHODES
    # ========================================
    
    class Meta:
        verbose_name = "Location"
        verbose_name_plural = "Locations"
        ordering = ['-date_creation']
        indexes = [
            models.Index(fields=['client', 'statut']),
            models.Index(fields=['vehicule', 'statut']),
            models.Index(fields=['concessionnaire', 'statut']),
            models.Index(fields=['date_debut', 'date_fin']),
            models.Index(fields=['statut', 'date_creation']),
        ]
    
    def __str__(self):
        return f"Location {self.id} - {self.vehicule.nom_complet} par {self.client.nom_complet}"
    
    def clean(self):
        """Validation personnalisée."""
        
        # Date de fin doit être après date de début
        if self.date_fin <= self.date_debut:
            raise ValidationError({
                'date_fin': 'La date de fin doit être après la date de début'
            })
        
        # Vérifier que le véhicule est disponible pour location
        if self.vehicule and not self.vehicule.est_disponible_location:
            raise ValidationError({
                'vehicule': 'Ce véhicule n\'est pas disponible à la location'
            })
        
        # Kilométrage retour doit être >= kilométrage départ
        if self.kilometrage_retour and self.kilometrage_depart:
            if self.kilometrage_retour < self.kilometrage_depart:
                raise ValidationError({
                    'kilometrage_retour': 'Le kilométrage au retour ne peut pas être inférieur au kilométrage au départ'
                })
    
    def save(self, *args, **kwargs):
        """Override save."""
        
        # Calculer automatiquement certains champs
        if not self.concessionnaire_id:
            self.concessionnaire = self.vehicule.concessionnaire
        
        if not self.concession_id:
            self.concession = self.vehicule.concession
        
        # Calculer le nombre de jours
        if self.date_debut and self.date_fin:
            delta = self.date_fin - self.date_debut
            self.nombre_jours = delta.days + 1  # +1 pour inclure le dernier jour
        
        # Calculer le prix total
        if self.prix_jour and self.nombre_jours:
            self.prix_total = self.prix_jour * self.nombre_jours
        
        super().save(*args, **kwargs)
    
    def confirmer(self):
        """Confirmer la location."""
        if self.statut == 'DEMANDE':
            self.statut = 'CONFIRMEE'
            self.save(update_fields=['statut'])
            return True
        return False
    
    def refuser(self):
        """Refuser la location."""
        if self.statut == 'DEMANDE':
            self.statut = 'ANNULEE'
            self.save(update_fields=['statut'])
            return True
        return False
    
    def enregistrer_depart(self, kilometrage, etat=""):
        """Enregistrer le départ du véhicule."""
        from django.utils import timezone
        
        if self.statut == 'CONFIRMEE':
            self.date_depart_reel = timezone.now()
            self.kilometrage_depart = kilometrage
            self.etat_depart = etat
            self.statut = 'EN_COURS'
            
            # Mettre le véhicule comme loué
            self.vehicule.statut = 'LOUE'
            self.vehicule.save(update_fields=['statut'])
            
            self.save(update_fields=['date_depart_reel', 'kilometrage_depart', 'etat_depart', 'statut'])
            return True
        return False
    
    def enregistrer_retour(self, kilometrage, etat=""):
        """Enregistrer le retour du véhicule et calculer les pénalités."""
        from django.utils import timezone
        from datetime import datetime, timedelta
        
        if self.statut == 'EN_COURS':
            self.date_retour_reel = timezone.now()
            self.kilometrage_retour = kilometrage
            self.etat_retour = etat
            
            # Calculer le retard
            date_fin_prevue = datetime.combine(self.date_fin, datetime.min.time())
            date_fin_prevue = timezone.make_aware(date_fin_prevue)
            
            if self.date_retour_reel > date_fin_prevue:
                delta = self.date_retour_reel - date_fin_prevue
                self.jours_retard = delta.days + 1
                
                # Calculer la pénalité
                penalite_par_jour = (self.prix_jour * self.taux_penalite_jour) / Decimal('100.00')
                self.montant_penalite = penalite_par_jour * self.jours_retard
            
            self.statut = 'TERMINEE'
            
            # Remettre le véhicule comme disponible
            self.vehicule.statut = 'DISPONIBLE'
            self.vehicule.kilometrage = kilometrage
            self.vehicule.save(update_fields=['statut', 'kilometrage'])
            
            # Incrémenter le compteur de locations du véhicule
            self.vehicule.nombre_locations += 1
            self.vehicule.save(update_fields=['nombre_locations'])
            
            self.save(update_fields=[
                'date_retour_reel',
                'kilometrage_retour',
                'etat_retour',
                'jours_retard',
                'montant_penalite',
                'statut'
            ])
            return True
        return False
    
    @property
    def duree_reelle(self):
        """Calculer la durée réelle de la location (en jours)."""
        if self.date_depart_reel and self.date_retour_reel:
            delta = self.date_retour_reel - self.date_depart_reel
            return delta.days + 1
        return None
    
    @property
    def kilometres_parcourus(self):
        """Calculer les kilomètres parcourus."""
        if self.kilometrage_retour and self.kilometrage_depart:
            return self.kilometrage_retour - self.kilometrage_depart
        return None
    
    @property
    def est_en_retard(self):
        """Vérifier si la location est en retard."""
        return self.jours_retard > 0
    
    @property
    def montant_total_final(self):
        """Calculer le montant total final (location + pénalités)."""
        return self.prix_total + self.montant_penalite


# ========================================
# MODÈLE CONTRAT LOCATION
# ========================================

class ContratLocation(models.Model):
    """
    Modèle représentant le contrat PDF d'une location.
    Relation One-to-One avec Location.
    ⭐ CONFORME AU DIAGRAMME DE CLASSE
    """
    
    location = models.OneToOneField(
        Location,
        on_delete=models.CASCADE,
        related_name='contrat',
        verbose_name="Location"
    )
    
    numero_contrat = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Numéro du contrat",
        help_text="Format: CONT-YYYYMMDD-XXXXX"
    )
    
    fichier_pdf = models.FileField(
        upload_to='contrats/locations/%Y/%m/',
        verbose_name="Fichier PDF du contrat"
    )
    
    date_generation = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de génération"
    )
    
    hash_contrat = models.CharField(
        max_length=64,
        blank=True,
        verbose_name="Hash SHA256 du contrat",
        help_text="Pour vérification d'intégrité"
    )
    
    class Meta:
        verbose_name = "Contrat de location"
        verbose_name_plural = "Contrats de location"
        ordering = ['-date_generation']
    
    def __str__(self):
        return f"Contrat {self.numero_contrat} - Location {self.location.id}"
    
    def save(self, *args, **kwargs):
        """Override save pour générer le numéro de contrat."""
        if not self.numero_contrat:
            from django.utils import timezone
            date_str = timezone.now().strftime('%Y%m%d')
            unique_id = str(uuid.uuid4())[:8].upper()
            self.numero_contrat = f"CONT-{date_str}-{unique_id}"
        
        super().save(*args, **kwargs)
    
    def generer_hash(self):
        """Générer le hash SHA256 du fichier PDF."""
        import hashlib
        
        if self.fichier_pdf:
            self.fichier_pdf.seek(0)
            file_hash = hashlib.sha256()
            
            for chunk in self.fichier_pdf.chunks():
                file_hash.update(chunk)
            
            self.hash_contrat = file_hash.hexdigest()
            self.save(update_fields=['hash_contrat'])