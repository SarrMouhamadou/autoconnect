from django.db import models
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from users.models import User


# ========================================
# MODÈLE RÉGION
# ========================================

class Region(models.Model):
    """
    Modèle représentant une région administrative du Sénégal.
    Utilisé pour organiser géographiquement les concessions.
    """
    
    nom = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Nom de la région",
        help_text="Ex: Dakar, Thiès, Saint-Louis"
    )
    
    code = models.CharField(
        max_length=10,
        unique=True,
        verbose_name="Code région",
        help_text="Code ISO ou administratif de la région"
    )
    
    description = models.TextField(
        blank=True,
        verbose_name="Description"
    )
    
    # Coordonnées géographiques du centre de la région
    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True,
        verbose_name="Latitude",
        help_text="Coordonnée GPS centrale de la région"
    )
    
    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True,
        verbose_name="Longitude",
        help_text="Coordonnée GPS centrale de la région"
    )
    
    # Statistiques
    nombre_concessions = models.IntegerField(
        default=0,
        verbose_name="Nombre de concessions",
        help_text="Nombre de concessions dans cette région"
    )
    
    # Métadonnées
    date_creation = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de création"
    )
    
    date_modification = models.DateTimeField(
        auto_now=True,
        verbose_name="Dernière modification"
    )
    
    class Meta:
        verbose_name = "Région"
        verbose_name_plural = "Régions"
        ordering = ['nom']
        indexes = [
            models.Index(fields=['nom']),
            models.Index(fields=['code']),
        ]
    
    def __str__(self):
        return self.nom
    
    def incrementer_concessions(self):
        """Incrémente le nombre de concessions dans la région."""
        self.nombre_concessions += 1
        self.save(update_fields=['nombre_concessions'])
    
    def decrementer_concessions(self):
        """Décrémente le nombre de concessions dans la région."""
        if self.nombre_concessions > 0:
            self.nombre_concessions -= 1
            self.save(update_fields=['nombre_concessions'])


# ========================================
# MODÈLE CONCESSION
# ========================================

class Concession(models.Model):
    """
    Modèle représentant une concession automobile (parking).
    Chaque concessionnaire peut avoir plusieurs concessions.
    """
    
    # ========================================
    # STATUT CHOICES
    # ========================================
    
    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente de validation'),
        ('VALIDE', 'Validé et actif'),
        ('SUSPENDU', 'Suspendu temporairement'),
        ('REJETE', 'Rejeté'),
    ]
    
    # ========================================
    # RELATIONS
    # ========================================
    
    concessionnaire = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='concessions',
        limit_choices_to={'type_utilisateur': 'CONCESSIONNAIRE'},
        verbose_name="Concessionnaire propriétaire"
    )
    
    region = models.ForeignKey(
        Region,
        on_delete=models.PROTECT,
        related_name='concessions',
        verbose_name="Région"
    )
    
    # ========================================
    # INFORMATIONS DE BASE
    # ========================================
    
    nom = models.CharField(
        max_length=200,
        verbose_name="Nom de la concession",
        help_text="Nom commercial de la concession"
    )
    
    description = models.TextField(
        verbose_name="Description",
        help_text="Description détaillée de la concession et de ses services"
    )
    
    # ========================================
    # COORDONNÉES
    # ========================================
    
    adresse = models.CharField(
        max_length=255,
        verbose_name="Adresse complète"
    )
    
    ville = models.CharField(
        max_length=100,
        verbose_name="Ville"
    )
    
    code_postal = models.CharField(
        max_length=10,
        blank=True,
        verbose_name="Code postal"
    )
    
    # Validation du numéro de téléphone sénégalais
    telephone_regex = RegexValidator(
        regex=r'^\+221[0-9]{9}$',
        message="Le numéro doit être au format: +221XXXXXXXXX"
    )
    
    telephone = models.CharField(
        validators=[telephone_regex],
        max_length=15,
        verbose_name="Téléphone",
        help_text="Format: +221XXXXXXXXX"
    )
    
    telephone_secondaire = models.CharField(
        validators=[telephone_regex],
        max_length=15,
        blank=True,
        verbose_name="Téléphone secondaire",
        help_text="Format: +221XXXXXXXXX"
    )
    
    email = models.EmailField(
        verbose_name="Email de contact"
    )
    
    site_web = models.URLField(
        blank=True,
        verbose_name="Site web"
    )
    
    # ========================================
    # GÉOLOCALISATION
    # ========================================
    
    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        verbose_name="Latitude",
        help_text="Coordonnée GPS (ex: 14.7167)"
    )
    
    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        verbose_name="Longitude",
        help_text="Coordonnée GPS (ex: -17.4677)"
    )
    
    # ========================================
    # HORAIRES D'OUVERTURE
    # ========================================
    
    horaires = models.JSONField(
        default=dict,
        verbose_name="Horaires d'ouverture",
        help_text="Format JSON: {'lundi': {'ouvert': true, 'debut': '08:00', 'fin': '18:00'}, ...}"
    )
    
    ouvert_weekend = models.BooleanField(
        default=False,
        verbose_name="Ouvert le weekend"
    )
    
    # ========================================
    # SERVICES PROPOSÉS
    # ========================================
    
    services = models.JSONField(
        default=list,
        verbose_name="Services proposés",
        help_text="Liste des services (Vente, Location, Entretien, Réparation, etc.)"
    )
    
    # ========================================
    # INFORMATIONS COMMERCIALES
    # ========================================
    
    numero_registre_commerce = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Numéro de registre de commerce",
        help_text="NINEA ou numéro d'immatriculation"
    )
    
    logo = models.ImageField(
        upload_to='concessions/logos/',
        blank=True,
        null=True,
        verbose_name="Logo de la concession"
    )
    
    photo_facade = models.ImageField(
        upload_to='concessions/facades/',
        blank=True,
        null=True,
        verbose_name="Photo de la façade"
    )
    
    # ========================================
    # STATUT ET VALIDATION
    # ========================================
    
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='EN_ATTENTE',
        verbose_name="Statut"
    )
    
    date_validation = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date de validation"
    )
    
    validee_par = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='concessions_validees',
        limit_choices_to={'type_utilisateur': 'ADMINISTRATEUR'},
        verbose_name="Validée par"
    )
    
    raison_rejet = models.TextField(
        blank=True,
        verbose_name="Raison du rejet",
        help_text="Explication si la concession est rejetée"
    )
    
    # ========================================
    # STATISTIQUES
    # ========================================
    
    nombre_vehicules = models.IntegerField(
        default=0,
        verbose_name="Nombre de véhicules",
        help_text="Nombre total de véhicules dans cette concession"
    )
    
    note_moyenne = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Note moyenne"
    )
    
    nombre_avis = models.IntegerField(
        default=0,
        verbose_name="Nombre d'avis"
    )
    
    nombre_vues = models.IntegerField(
        default=0,
        verbose_name="Nombre de vues",
        help_text="Nombre de fois où la fiche a été consultée"
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
    
    est_visible = models.BooleanField(
        default=True,
        verbose_name="Visible sur la plateforme",
        help_text="Permet de masquer temporairement la concession"
    )
    
    # ========================================
    # META ET MÉTHODES
    # ========================================
    
    class Meta:
        verbose_name = "Concession"
        verbose_name_plural = "Concessions"
        ordering = ['-date_creation']
        indexes = [
            models.Index(fields=['concessionnaire', 'statut']),
            models.Index(fields=['region', 'statut']),
            models.Index(fields=['ville']),
            models.Index(fields=['statut', 'est_visible']),
            models.Index(fields=['latitude', 'longitude']),
        ]
        unique_together = [['concessionnaire', 'nom']]
    
    def __str__(self):
        return f"{self.nom} - {self.ville}"
    
    def save(self, *args, **kwargs):
        """Override save pour gérer le compteur de concessions par région."""
        is_new = self.pk is None
        old_region = None
        
        if not is_new:
            # Récupérer l'ancienne région si la concession existe déjà
            old_concession = Concession.objects.filter(pk=self.pk).first()
            if old_concession:
                old_region = old_concession.region
        
        super().save(*args, **kwargs)
        
        # Mettre à jour les compteurs de régions
        if is_new:
            # Nouvelle concession : incrémenter la région
            self.region.incrementer_concessions()
        elif old_region and old_region != self.region:
            # Changement de région : décrémenter l'ancienne, incrémenter la nouvelle
            old_region.decrementer_concessions()
            self.region.incrementer_concessions()
    
    def delete(self, *args, **kwargs):
        """Override delete pour décrémenter le compteur de la région."""
        region = self.region
        super().delete(*args, **kwargs)
        region.decrementer_concessions()
    
    def get_coordonnees_gps(self):
        """Retourne les coordonnées GPS sous forme de tuple."""
        return (float(self.latitude), float(self.longitude))
    
    def est_ouverte_aujourdhui(self):
        """
        Vérifie si la concession est ouverte aujourd'hui.
        À implémenter selon la logique des horaires.
        """
        # TODO: Implémenter la logique basée sur self.horaires
        return True
    
    def est_validee(self):
        """Vérifie si la concession est validée et active."""
        return self.statut == 'VALIDE' and self.est_visible
    
    def peut_ajouter_vehicules(self):
        """Vérifie si le concessionnaire peut ajouter des véhicules."""
        return self.est_validee()
    
    def incrementer_vues(self):
        """Incrémente le nombre de vues de la concession."""
        self.nombre_vues += 1
        self.save(update_fields=['nombre_vues'])
    
    def get_adresse_complete(self):
        """Retourne l'adresse complète formatée."""
        adresse_parts = [self.adresse, self.ville]
        if self.code_postal:
            adresse_parts.append(self.code_postal)
        adresse_parts.append(self.region.nom)
        return ", ".join(adresse_parts)
    
    def mettre_a_jour_note(self):
        """
        Met à jour la note moyenne de la concession.
        À implémenter après création du modèle Avis.
        """
        # TODO: Calculer depuis les avis
        pass