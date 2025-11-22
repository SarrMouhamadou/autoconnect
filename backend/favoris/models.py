# backend/favoris/models.py
# Modèles pour les favoris et l'historique

from django.db import models
from users.models import User
from vehicules.models import Vehicule


# ========================================
# MODÈLE FAVORI
# ========================================

class Favori(models.Model):
    """
    Modèle représentant un véhicule ajouté aux favoris par un client.
    Relation Many-to-Many entre Client et Vehicule.
    ⭐ CONFORME AU DIAGRAMME DE CLASSE
    """
    
    # ========================================
    # RELATIONS
    # ========================================
    
    client = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='favoris',
        limit_choices_to={'type_utilisateur': 'CLIENT'},
        verbose_name="Client"
    )
    
    vehicule = models.ForeignKey(
        Vehicule,
        on_delete=models.CASCADE,
        related_name='favoris',
        verbose_name="Véhicule"
    )
    
    # ========================================
    # INFORMATIONS
    # ========================================
    
    date_ajout = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date d'ajout aux favoris"
    )
    
    # Alertes sur prix
    alerte_prix_active = models.BooleanField(
        default=False,
        verbose_name="Alerte prix activée",
        help_text="Notifier si le prix baisse"
    )
    
    prix_initial = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Prix initial (FCFA)",
        help_text="Prix au moment de l'ajout aux favoris"
    )
    
    # Notes personnelles
    notes = models.TextField(
        blank=True,
        verbose_name="Notes personnelles",
        help_text="Notes du client sur ce véhicule"
    )
    
    # ========================================
    # META & MÉTHODES
    # ========================================
    
    class Meta:
        verbose_name = "Favori"
        verbose_name_plural = "Favoris"
        unique_together = ['client', 'vehicule']  # Un client ne peut ajouter qu'une fois le même véhicule
        ordering = ['-date_ajout']
        indexes = [
            models.Index(fields=['client', 'date_ajout']),
            models.Index(fields=['vehicule']),
        ]
    
    def __str__(self):
        return f"{self.client.nom_complet} - {self.vehicule.nom_complet}"
    
    def save(self, *args, **kwargs):
        """Override save pour enregistrer le prix initial."""
        if not self.prix_initial and self.vehicule:
            # Enregistrer le prix de location ou de vente selon disponibilité
            if self.vehicule.est_disponible_location and self.vehicule.prix_location_jour:
                self.prix_initial = self.vehicule.prix_location_jour
            elif self.vehicule.est_disponible_vente and self.vehicule.prix_vente:
                self.prix_initial = self.vehicule.prix_vente
        
        super().save(*args, **kwargs)
    
    def verifier_baisse_prix(self):
        """Vérifier si le prix a baissé depuis l'ajout aux favoris."""
        if not self.prix_initial:
            return False
        
        prix_actuel = None
        if self.vehicule.est_disponible_location and self.vehicule.prix_location_jour:
            prix_actuel = self.vehicule.prix_location_jour
        elif self.vehicule.est_disponible_vente and self.vehicule.prix_vente:
            prix_actuel = self.vehicule.prix_vente
        
        if prix_actuel and prix_actuel < self.prix_initial:
            return True
        
        return False
    
    @property
    def difference_prix(self):
        """Calculer la différence de prix."""
        if not self.prix_initial:
            return None
        
        prix_actuel = None
        if self.vehicule.est_disponible_location and self.vehicule.prix_location_jour:
            prix_actuel = self.vehicule.prix_location_jour
        elif self.vehicule.est_disponible_vente and self.vehicule.prix_vente:
            prix_actuel = self.vehicule.prix_vente
        
        if prix_actuel:
            return prix_actuel - self.prix_initial
        
        return None


# ========================================
# MODÈLE HISTORIQUE
# ========================================

class Historique(models.Model):
    """
    Modèle représentant l'historique des actions d'un utilisateur.
    Enregistrement automatique des actions importantes.
    ⭐ CONFORME AU DIAGRAMME DE CLASSE
    """
    
    # ========================================
    # TYPE D'ACTION CHOICES
    # ========================================
    
    TYPE_ACTION_CHOICES = [
        # Authentification
        ('CONNEXION', 'Connexion'),
        ('DECONNEXION', 'Déconnexion'),
        
        # Profil
        ('MAJ_PROFIL', 'Mise à jour du profil'),
        ('CHANGE_PASSWORD', 'Changement de mot de passe'),
        
        # Véhicules
        ('CONSULTATION_VEHICULE', 'Consultation d\'un véhicule'),
        ('AJOUT_FAVORI', 'Ajout aux favoris'),
        ('RETRAIT_FAVORI', 'Retrait des favoris'),
        
        # Demandes
        ('DEMANDE_CONTACT', 'Demande de contact'),
        ('DEMANDE_ESSAI', 'Demande d\'essai'),
        ('DEMANDE_DEVIS', 'Demande de devis'),
        
        # Locations
        ('DEMANDE_LOCATION', 'Demande de location'),
        ('LOCATION_CONFIRMEE', 'Location confirmée'),
        ('LOCATION_ANNULEE', 'Location annulée'),
        ('DEPART_VEHICULE', 'Départ du véhicule'),
        ('RETOUR_VEHICULE', 'Retour du véhicule'),
        
        # Avis
        ('AVIS_PUBLIE', 'Avis publié'),
        ('AVIS_MODIFIE', 'Avis modifié'),
        
        # Concession (pour concessionnaires)
        ('AJOUT_CONCESSION', 'Ajout d\'une concession'),
        ('MAJ_CONCESSION', 'Mise à jour d\'une concession'),
        ('AJOUT_VEHICULE', 'Ajout d\'un véhicule'),
        ('MAJ_VEHICULE', 'Mise à jour d\'un véhicule'),
    ]
    
    # ========================================
    # RELATIONS
    # ========================================
    
    utilisateur = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='historique',
        verbose_name="Utilisateur"
    )
    
    # Relations optionnelles selon le type d'action
    vehicule = models.ForeignKey(
        Vehicule,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='historique',
        verbose_name="Véhicule concerné"
    )
    
    # ========================================
    # INFORMATIONS
    # ========================================
    
    type_action = models.CharField(
        max_length=50,
        choices=TYPE_ACTION_CHOICES,
        verbose_name="Type d'action"
    )
    
    description = models.TextField(
        blank=True,
        verbose_name="Description de l'action"
    )
    
    # Métadonnées techniques
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name="Adresse IP"
    )
    
    user_agent = models.TextField(
        blank=True,
        verbose_name="User Agent (navigateur)"
    )
    
    # Données additionnelles (JSON)
    donnees_supplementaires = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Données supplémentaires",
        help_text="Informations additionnelles en JSON"
    )
    
    # ========================================
    # MÉTADONNÉES
    # ========================================
    
    date_action = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de l'action"
    )
    
    # ========================================
    # META & MÉTHODES
    # ========================================
    
    class Meta:
        verbose_name = "Historique"
        verbose_name_plural = "Historique"
        ordering = ['-date_action']
        indexes = [
            models.Index(fields=['utilisateur', 'date_action']),
            models.Index(fields=['type_action', 'date_action']),
            models.Index(fields=['vehicule', 'date_action']),
        ]
    
    def __str__(self):
        return f"{self.utilisateur.nom_complet} - {self.get_type_action_display()} - {self.date_action.strftime('%d/%m/%Y %H:%M')}"
    
    @classmethod
    def enregistrer_action(cls, utilisateur, type_action, description='', vehicule=None, **kwargs):
        """
        Méthode utilitaire pour enregistrer une action dans l'historique.
        
        Args:
            utilisateur: Instance User
            type_action: Type d'action (choix de TYPE_ACTION_CHOICES)
            description: Description optionnelle
            vehicule: Instance Vehicule optionnelle
            **kwargs: Données supplémentaires (request, etc.)
        
        Returns:
            Instance Historique créée
        """
        donnees = {}
        
        # Extraire IP et User Agent de la request si fournie
        request = kwargs.get('request')
        ip_address = None
        user_agent = ''
        
        if request:
            # Obtenir l'IP
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0]
            else:
                ip_address = request.META.get('REMOTE_ADDR')
            
            # Obtenir le User Agent
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            # Retirer request des kwargs avant de stocker
            kwargs.pop('request', None)
        
        # Stocker les autres données
        donnees = kwargs
        
        return cls.objects.create(
            utilisateur=utilisateur,
            type_action=type_action,
            description=description,
            vehicule=vehicule,
            ip_address=ip_address,
            user_agent=user_agent,
            donnees_supplementaires=donnees
        )
    
    @property
    def action_display(self):
        """Retourner un texte formaté de l'action."""
        base = self.get_type_action_display()
        if self.vehicule:
            base += f" - {self.vehicule.nom_complet}"
        return base