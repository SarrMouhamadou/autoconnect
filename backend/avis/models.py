# backend/avis/models.py
# Modèle pour les avis et évaluations

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from users.models import User
from vehicules.models import Vehicule
from locations.models import Location


class Avis(models.Model):
    """
    Modèle représentant un avis/évaluation d'un client sur un véhicule.
    Un client peut donner un avis uniquement après avoir loué un véhicule.
    ⭐ CONFORME AU DIAGRAMME DE CLASSE
    """
    
    # ========================================
    # RELATIONS
    # ========================================
    
    client = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='avis_donnes',
        limit_choices_to={'type_utilisateur': 'CLIENT'},
        verbose_name="Client"
    )
    
    vehicule = models.ForeignKey(
        Vehicule,
        on_delete=models.CASCADE,
        related_name='avis',
        verbose_name="Véhicule"
    )
    
    location = models.OneToOneField(
        Location,
        on_delete=models.CASCADE,
        related_name='avis',
        verbose_name="Location associée",
        help_text="Avis basé sur cette location"
    )
    
    # ========================================
    # NOTATION
    # ========================================
    
    note = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Note (1-5 étoiles)",
        help_text="Note de 1 (très mauvais) à 5 (excellent)"
    )
    
    # Notes détaillées (optionnelles)
    note_confort = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True,
        verbose_name="Note confort"
    )
    
    note_performance = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True,
        verbose_name="Note performance"
    )
    
    note_consommation = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True,
        verbose_name="Note consommation"
    )
    
    note_proprete = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True,
        verbose_name="Note propreté"
    )
    
    # ========================================
    # COMMENTAIRE
    # ========================================
    
    titre = models.CharField(
        max_length=200,
        verbose_name="Titre de l'avis"
    )
    
    commentaire = models.TextField(
        verbose_name="Commentaire détaillé"
    )
    
    # Points positifs et négatifs
    points_positifs = models.TextField(
        blank=True,
        verbose_name="Points positifs",
        help_text="Ce qui a plu au client"
    )
    
    points_negatifs = models.TextField(
        blank=True,
        verbose_name="Points négatifs",
        help_text="Ce qui pourrait être amélioré"
    )
    
    # ========================================
    # RECOMMANDATION
    # ========================================
    
    recommande = models.BooleanField(
        default=True,
        verbose_name="Recommande ce véhicule",
        help_text="Le client recommande-t-il ce véhicule ?"
    )
    
    # ========================================
    # RÉPONSE DU CONCESSIONNAIRE
    # ========================================
    
    reponse = models.TextField(
        blank=True,
        verbose_name="Réponse du concessionnaire"
    )
    
    date_reponse = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date de la réponse"
    )
    
    repondu_par = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='avis_repondus',
        verbose_name="Répondu par"
    )
    
    # ========================================
    # MODÉRATION
    # ========================================
    
    est_valide = models.BooleanField(
        default=True,
        verbose_name="Avis validé",
        help_text="Validé par la modération"
    )
    
    est_signale = models.BooleanField(
        default=False,
        verbose_name="Avis signalé",
        help_text="Signalé comme inapproprié"
    )
    
    raison_signalement = models.TextField(
        blank=True,
        verbose_name="Raison du signalement"
    )
    
    modere_par = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='avis_moderes',
        verbose_name="Modéré par"
    )
    
    date_moderation = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date de modération"
    )
    
    # ========================================
    # UTILITÉ
    # ========================================
    
    nb_personnes_utile = models.IntegerField(
        default=0,
        verbose_name="Nombre de personnes trouvant cet avis utile"
    )
    
    nb_personnes_inutile = models.IntegerField(
        default=0,
        verbose_name="Nombre de personnes trouvant cet avis inutile"
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
        verbose_name = "Avis"
        verbose_name_plural = "Avis"
        ordering = ['-date_creation']
        unique_together = ['client', 'location']  # Un seul avis par location
        indexes = [
            models.Index(fields=['vehicule', 'est_valide']),
            models.Index(fields=['client']),
            models.Index(fields=['note']),
            models.Index(fields=['date_creation']),
            models.Index(fields=['est_signale']),
        ]
    
    def __str__(self):
        return f"Avis de {self.client.nom_complet} sur {self.vehicule.nom_complet} - {self.note}★"
    
    def clean(self):
        """Validation personnalisée."""
        
        # Vérifier que le client a bien loué ce véhicule
        if self.location.client != self.client:
            raise ValidationError({
                'client': "Le client doit être celui de la location"
            })
        
        if self.location.vehicule != self.vehicule:
            raise ValidationError({
                'vehicule': "Le véhicule doit être celui de la location"
            })
        
        # Vérifier que la location est terminée
        if self.location.statut != 'TERMINEE':
            raise ValidationError(
                "Un avis ne peut être donné que sur une location terminée"
            )
    
    def save(self, *args, **kwargs):
        """Override save."""
        self.clean()
        
        is_new = self.pk is None
        
        super().save(*args, **kwargs)
        
        # Mettre à jour la note moyenne du véhicule
        if is_new or 'note' in kwargs.get('update_fields', []):
            self.vehicule.mettre_a_jour_note()
    
    def repondre(self, reponse, user):
        """Ajouter une réponse du concessionnaire."""
        from django.utils import timezone
        
        self.reponse = reponse
        self.date_reponse = timezone.now()
        self.repondu_par = user
        self.save(update_fields=['reponse', 'date_reponse', 'repondu_par'])
    
    def signaler(self, raison):
        """Signaler l'avis comme inapproprié."""
        self.est_signale = True
        self.raison_signalement = raison
        self.save(update_fields=['est_signale', 'raison_signalement'])
    
    def moderer(self, valide, user):
        """Modérer l'avis (admin)."""
        from django.utils import timezone
        
        self.est_valide = valide
        self.modere_par = user
        self.date_moderation = timezone.now()
        self.save(update_fields=['est_valide', 'modere_par', 'date_moderation'])
        
        # Mettre à jour la note du véhicule
        self.vehicule.mettre_a_jour_note()
    
    def marquer_utile(self):
        """Incrémenter le compteur d'utilité."""
        self.nb_personnes_utile += 1
        self.save(update_fields=['nb_personnes_utile'])
    
    def marquer_inutile(self):
        """Incrémenter le compteur d'inutilité."""
        self.nb_personnes_inutile += 1
        self.save(update_fields=['nb_personnes_inutile'])
    
    @property
    def score_utilite(self):
        """Calculer le score d'utilité."""
        total = self.nb_personnes_utile + self.nb_personnes_inutile
        if total == 0:
            return 0
        return (self.nb_personnes_utile / total) * 100
    
    @property
    def note_moyenne_detaillee(self):
        """Calculer la note moyenne des critères détaillés."""
        notes = [
            self.note_confort,
            self.note_performance,
            self.note_consommation,
            self.note_proprete
        ]
        notes_valides = [n for n in notes if n is not None]
        
        if not notes_valides:
            return None
        
        return sum(notes_valides) / len(notes_valides)
    
    @property
    def a_reponse(self):
        """Vérifier si le concessionnaire a répondu."""
        return bool(self.reponse)
    
    def delete(self, *args, **kwargs):
        """Override delete pour mettre à jour la note du véhicule."""
        vehicule = self.vehicule
        super().delete(*args, **kwargs)
        vehicule.mettre_a_jour_note()