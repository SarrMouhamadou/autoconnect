from django.db import models

# Create your models here.
# backend/promotions/models.py
# Modèles pour les promotions

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from users.models import User
from vehicules.models import Vehicule, Categorie
from concessions.models import Concession


class Promotion(models.Model):
    """
    Modèle représentant une promotion ou un code promo.
    ⭐ CONFORME AU DIAGRAMME DE CLASSE
    """
    
    # ========================================
    # TYPE DE PROMOTION
    # ========================================
    
    TYPE_PROMOTION_CHOICES = [
        ('POURCENTAGE', 'Réduction en pourcentage'),
        ('MONTANT_FIXE', 'Réduction montant fixe'),
    ]
    
    # ========================================
    # STATUT
    # ========================================
    
    STATUT_CHOICES = [
        ('ACTIF', 'Actif'),
        ('INACTIF', 'Inactif'),
        ('EXPIRE', 'Expiré'),
    ]
    
    # ========================================
    # INFORMATIONS DE BASE
    # ========================================
    
    nom = models.CharField(
        max_length=200,
        verbose_name="Nom de la promotion"
    )
    
    description = models.TextField(
        blank=True,
        verbose_name="Description"
    )
    
    code = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Code promo",
        help_text="Code à saisir par le client (ex: SUMMER2024)"
    )
    
    # ========================================
    # TYPE ET VALEUR DE LA RÉDUCTION
    # ========================================
    
    type_reduction = models.CharField(
        max_length=20,
        choices=TYPE_PROMOTION_CHOICES,
        default='POURCENTAGE',
        verbose_name="Type de réduction"
    )
    
    valeur_reduction = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Valeur de la réduction",
        help_text="Pourcentage (0-100) ou montant fixe en FCFA"
    )
    
    # ========================================
    # VALIDITÉ
    # ========================================
    
    date_debut = models.DateField(
        verbose_name="Date de début"
    )
    
    date_fin = models.DateField(
        verbose_name="Date de fin"
    )
    
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='ACTIF',
        verbose_name="Statut"
    )
    
    # ========================================
    # LIMITES D'UTILISATION
    # ========================================
    
    nombre_utilisations_max = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name="Nombre d'utilisations max (global)",
        help_text="Laisser vide pour illimité"
    )
    
    utilisations_par_client = models.PositiveIntegerField(
        default=1,
        verbose_name="Utilisations max par client"
    )
    
    nombre_utilisations = models.PositiveIntegerField(
        default=0,
        verbose_name="Nombre d'utilisations actuelles"
    )
    
    # ========================================
    # CONDITIONS D'APPLICATION
    # ========================================
    
    # Montant minimum de commande
    montant_minimum = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name="Montant minimum (FCFA)",
        help_text="Montant minimum de location pour appliquer la promo"
    )
    
    # Réduction maximum (pour les pourcentages)
    reduction_maximum = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name="Réduction maximum (FCFA)",
        help_text="Plafond de réduction (pour les pourcentages)"
    )
    
    # ========================================
    # CIBLAGE (optionnel)
    # ========================================
    
    # Promotion créée par un concessionnaire
    concessionnaire = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='promotions_creees',
        limit_choices_to={'type_utilisateur': 'CONCESSIONNAIRE'},
        verbose_name="Concessionnaire"
    )
    
    # Ciblage sur concession spécifique
    concession = models.ForeignKey(
        Concession,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='promotions',
        verbose_name="Concession ciblée",
        help_text="Laisser vide pour toutes les concessions du concessionnaire"
    )
    
    # Ciblage sur véhicules spécifiques
    vehicules = models.ManyToManyField(
        Vehicule,
        blank=True,
        related_name='promotions',
        verbose_name="Véhicules ciblés",
        help_text="Laisser vide pour tous les véhicules"
    )
    
    # Ciblage sur catégories
    categories = models.ManyToManyField(
        Categorie,
        blank=True,
        related_name='promotions',
        verbose_name="Catégories ciblées",
        help_text="Laisser vide pour toutes les catégories"
    )
    
    # Réservé à certains clients (VIP)
    clients_cibles = models.ManyToManyField(
        User,
        blank=True,
        related_name='promotions_reservees',
        limit_choices_to={'type_utilisateur': 'CLIENT'},
        verbose_name="Clients ciblés (VIP)",
        help_text="Laisser vide pour tous les clients"
    )
    
    # ========================================
    # OPTIONS
    # ========================================
    
    est_cumulable = models.BooleanField(
        default=False,
        verbose_name="Cumulable avec d'autres promotions"
    )
    
    est_visible = models.BooleanField(
        default=True,
        verbose_name="Visible publiquement",
        help_text="Si désactivé, le code doit être saisi manuellement"
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
        verbose_name = "Promotion"
        verbose_name_plural = "Promotions"
        ordering = ['-date_creation']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['statut', 'date_debut', 'date_fin']),
            models.Index(fields=['concessionnaire']),
        ]
    
    def __str__(self):
        return f"{self.nom} ({self.code})"
    
    def save(self, *args, **kwargs):
        """Override save pour mettre à jour le statut."""
        self.mettre_a_jour_statut()
        super().save(*args, **kwargs)
    
    def mettre_a_jour_statut(self):
        """Mettre à jour automatiquement le statut selon les dates."""
        today = timezone.now().date()
        
        if self.statut != 'INACTIF':  # Ne pas changer si désactivé manuellement
            if today > self.date_fin:
                self.statut = 'EXPIRE'
            elif today >= self.date_debut:
                self.statut = 'ACTIF'
    
    @property
    def est_valide(self):
        """Vérifier si la promotion est actuellement valide."""
        today = timezone.now().date()
        
        # Vérifier le statut
        if self.statut != 'ACTIF':
            return False
        
        # Vérifier les dates
        if today < self.date_debut or today > self.date_fin:
            return False
        
        # Vérifier le nombre d'utilisations
        if self.nombre_utilisations_max and self.nombre_utilisations >= self.nombre_utilisations_max:
            return False
        
        return True
    
    @property
    def reste_utilisations(self):
        """Calculer le nombre d'utilisations restantes."""
        if self.nombre_utilisations_max:
            return max(0, self.nombre_utilisations_max - self.nombre_utilisations)
        return None  # Illimité
    
    @property
    def jours_restants(self):
        """Calculer le nombre de jours restants."""
        today = timezone.now().date()
        if today > self.date_fin:
            return 0
        return (self.date_fin - today).days
    
    def peut_etre_utilise_par(self, client):
        """Vérifier si un client peut utiliser cette promotion."""
        if not self.est_valide:
            return False, "Cette promotion n'est plus valide"
        
        # Vérifier si ciblé sur des clients spécifiques
        if self.clients_cibles.exists() and client not in self.clients_cibles.all():
            return False, "Cette promotion ne vous est pas destinée"
        
        # Vérifier le nombre d'utilisations par client
        nb_utilisations_client = self.utilisations.filter(client=client).count()
        if nb_utilisations_client >= self.utilisations_par_client:
            return False, f"Vous avez déjà utilisé ce code {nb_utilisations_client} fois"
        
        return True, "OK"
    
    def applicable_a_vehicule(self, vehicule):
        """Vérifier si la promotion s'applique à un véhicule."""
        # Vérifier le concessionnaire
        if vehicule.concessionnaire != self.concessionnaire:
            return False
        
        # Vérifier la concession
        if self.concession and vehicule.concession != self.concession:
            return False
        
        # Vérifier les véhicules ciblés
        if self.vehicules.exists() and vehicule not in self.vehicules.all():
            return False
        
        # Vérifier les catégories ciblées
        if self.categories.exists() and vehicule.categorie not in self.categories.all():
            return False
        
        return True
    
    def calculer_reduction(self, montant_initial):
        """Calculer le montant de la réduction."""
        if self.type_reduction == 'POURCENTAGE':
            reduction = montant_initial * (self.valeur_reduction / 100)
            
            # Appliquer le plafond si défini
            if self.reduction_maximum and reduction > self.reduction_maximum:
                reduction = self.reduction_maximum
        else:
            # Montant fixe
            reduction = min(self.valeur_reduction, montant_initial)
        
        return reduction
    
    def appliquer(self, client, location=None):
        """Appliquer la promotion et créer l'utilisation."""
        # Vérifier si applicable
        peut_utiliser, message = self.peut_etre_utilise_par(client)
        if not peut_utiliser:
            raise ValueError(message)
        
        # Créer l'utilisation
        utilisation = UtilisationPromotion.objects.create(
            promotion=self,
            client=client,
            location=location
        )
        
        # Incrémenter le compteur
        self.nombre_utilisations += 1
        self.save(update_fields=['nombre_utilisations'])
        
        return utilisation


class UtilisationPromotion(models.Model):
    """
    Modèle pour suivre l'utilisation des promotions.
    """
    
    # ========================================
    # RELATIONS
    # ========================================
    
    promotion = models.ForeignKey(
        Promotion,
        on_delete=models.CASCADE,
        related_name='utilisations',
        verbose_name="Promotion"
    )
    
    client = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='promotions_utilisees',
        limit_choices_to={'type_utilisateur': 'CLIENT'},
        verbose_name="Client"
    )
    
    location = models.ForeignKey(
        'locations.Location',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='promotions_appliquees',
        verbose_name="Location associée"
    )
    
    # ========================================
    # INFORMATIONS
    # ========================================
    
    montant_reduction = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Montant de la réduction (FCFA)"
    )
    
    date_utilisation = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date d'utilisation"
    )
    
    # ========================================
    # META & MÉTHODES
    # ========================================
    
    class Meta:
        verbose_name = "Utilisation de promotion"
        verbose_name_plural = "Utilisations de promotions"
        ordering = ['-date_utilisation']
        indexes = [
            models.Index(fields=['promotion', 'client']),
            models.Index(fields=['date_utilisation']),
        ]
    
    def __str__(self):
        return f"{self.client.nom_complet} - {self.promotion.code} - {self.date_utilisation.strftime('%d/%m/%Y')}"