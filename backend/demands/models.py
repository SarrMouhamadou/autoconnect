# backend/demands/models.py
# Modèle pour les demandes de contact, essai, devis

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import User
from vehicules.models import Vehicule


class DemandeContact(models.Model):
    """
    Demande de contact, essai ou devis d'un client pour un véhicule.
    Relation Many-to-One avec Client, Vehicule, Concessionnaire.
    ⭐ CONFORME AU DIAGRAMME DE CLASSE
    """
    
    # ========================================
    # CHOICES
    # ========================================
    
    TYPE_DEMANDE_CHOICES = [
        ('CONTACT', 'Demande de contact'),
        ('ESSAI', 'Demande d\'essai'),
        ('DEVIS', 'Demande de devis'),
        ('INFORMATION', 'Demande d\'information'),
    ]
    
    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente de traitement'),
        ('EN_COURS', 'En cours de traitement'),
        ('TRAITEE', 'Traitée'),
        ('ANNULEE', 'Annulée par le client'),
    ]
    
    # ========================================
    # RELATIONS
    # ========================================
    
    client = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='demandes_envoyees',
        limit_choices_to={'type_utilisateur': 'CLIENT'},
        verbose_name="Client demandeur"
    )
    
    vehicule = models.ForeignKey(
        Vehicule,
        on_delete=models.CASCADE,
        related_name='demandes',
        verbose_name="Véhicule concerné"
    )
    
    concessionnaire = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='demandes_recues',
        limit_choices_to={'type_utilisateur': 'CONCESSIONNAIRE'},
        verbose_name="Concessionnaire destinataire"
    )
    
    # ========================================
    # INFORMATIONS DE LA DEMANDE
    # ========================================
    
    type_demande = models.CharField(
        max_length=20,
        choices=TYPE_DEMANDE_CHOICES,
        default='CONTACT',
        verbose_name="Type de demande"
    )
    
    objet = models.CharField(
        max_length=200,
        verbose_name="Objet de la demande",
        help_text="Résumé court de la demande"
    )
    
    message = models.TextField(
        verbose_name="Message du client",
        help_text="Description détaillée de la demande"
    )
    
    # Informations complémentaires pour essai
    date_souhaitee_essai = models.DateField(
        null=True,
        blank=True,
        verbose_name="Date souhaitée pour l'essai"
    )
    
    heure_souhaitee_essai = models.TimeField(
        null=True,
        blank=True,
        verbose_name="Heure souhaitée pour l'essai"
    )
    
    # ========================================
    # COORDONNÉES DU CLIENT (au moment de la demande)
    # ========================================
    
    telephone_contact = models.CharField(
        max_length=15,
        verbose_name="Téléphone de contact"
    )
    
    email_contact = models.EmailField(
        verbose_name="Email de contact"
    )
    
    # ========================================
    # STATUT & TRAITEMENT
    # ========================================
    
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='EN_ATTENTE',
        verbose_name="Statut de la demande"
    )
    
    # Réponse du concessionnaire
    reponse = models.TextField(
        blank=True,
        null=True,
        verbose_name="Réponse du concessionnaire"
    )
    
    date_reponse = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="Date de la réponse"
    )
    
    repondu_par = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='demandes_repondues',
        verbose_name="Répondu par"
    )
    
    # ========================================
    # NOTES INTERNES (visible uniquement par le concessionnaire)
    # ========================================
    
    notes_internes = models.TextField(
        blank=True,
        verbose_name="Notes internes",
        help_text="Notes visibles uniquement par le concessionnaire"
    )
    
    # ========================================
    # MÉTADONNÉES
    # ========================================
    
    date_creation = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de création"
    )
    
    date_modification = models.DateTimeField(
        auto_now=True,
        verbose_name="Dernière modification"
    )
    
    # ========================================
    # META & MÉTHODES
    # ========================================
    
    class Meta:
        verbose_name = "Demande de contact"
        verbose_name_plural = "Demandes de contact"
        ordering = ['-date_creation']
        indexes = [
            models.Index(fields=['client', 'statut']),
            models.Index(fields=['concessionnaire', 'statut']),
            models.Index(fields=['vehicule', 'statut']),
            models.Index(fields=['type_demande', 'statut']),
            models.Index(fields=['date_creation']),
        ]
    
    def __str__(self):
        return f"{self.get_type_demande_display()} - {self.vehicule.nom_complet} par {self.client.nom_complet}"
    
    def marquer_en_cours(self):
        """Marquer la demande comme en cours de traitement."""
        self.statut = 'EN_COURS'
        self.save(update_fields=['statut'])
    
    def marquer_traitee(self, reponse, repondu_par):
        """Marquer la demande comme traitée avec une réponse."""
        from django.utils import timezone
        
        self.statut = 'TRAITEE'
        self.reponse = reponse
        self.date_reponse = timezone.now()
        self.repondu_par = repondu_par
        self.save(update_fields=['statut', 'reponse', 'date_reponse', 'repondu_par'])
    
    def annuler(self):
        """Annuler la demande (par le client)."""
        if self.statut == 'EN_ATTENTE' or self.statut == 'EN_COURS':
            self.statut = 'ANNULEE'
            self.save(update_fields=['statut'])
            return True
        return False
    
    @property
    def est_en_attente(self):
        """Vérifier si la demande est en attente."""
        return self.statut == 'EN_ATTENTE'
    
    @property
    def est_traitee(self):
        """Vérifier si la demande est traitée."""
        return self.statut == 'TRAITEE'
    
    @property
    def peut_etre_annulee(self):
        """Vérifier si la demande peut être annulée."""
        return self.statut in ['EN_ATTENTE', 'EN_COURS']
    
    @property
    def delai_reponse(self):
        """Calculer le délai de réponse (en heures)."""
        if self.date_reponse:
            delta = self.date_reponse - self.date_creation
            return round(delta.total_seconds() / 3600, 1)  # En heures
        return None
    
    def save(self, *args, **kwargs):
        """Override save pour définir le concessionnaire automatiquement."""
        if not self.concessionnaire_id:
            # Le concessionnaire est celui qui possède le véhicule
            self.concessionnaire = self.vehicule.concessionnaire
        
        # Copier les coordonnées du client si non fournies
        if not self.telephone_contact:
            self.telephone_contact = self.client.telephone or ''
        
        if not self.email_contact:
            self.email_contact = self.client.email
        
        super().save(*args, **kwargs)