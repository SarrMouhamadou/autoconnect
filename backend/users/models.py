from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _

# ========================================
# MODÈLE ROLE
# ========================================

class Role(models.Model):
    """
    Modèle représentant les rôles des utilisateurs dans le système.
    Permet une gestion flexible des permissions.
    """
    
    # Constantes pour les types de rôles
    CLIENT = 'CLIENT'
    CONCESSIONNAIRE_PROPRIETAIRE = 'CONCESSIONNAIRE_PROPRIETAIRE'
    CONCESSIONNAIRE_GERANT = 'CONCESSIONNAIRE_GERANT'
    CONCESSIONNAIRE_EMPLOYE = 'CONCESSIONNAIRE_EMPLOYE'
    ADMINISTRATEUR_SUPER = 'ADMINISTRATEUR_SUPER'
    ADMINISTRATEUR_MODERATEUR = 'ADMINISTRATEUR_MODERATEUR'
    
    TYPE_ROLE_CHOICES = [
        (CLIENT, 'Client'),
        (CONCESSIONNAIRE_PROPRIETAIRE, 'Concessionnaire - Propriétaire'),
        (CONCESSIONNAIRE_GERANT, 'Concessionnaire - Gérant'),
        (CONCESSIONNAIRE_EMPLOYE, 'Concessionnaire - Employé'),
        (ADMINISTRATEUR_SUPER, 'Administrateur - Super Admin'),
        (ADMINISTRATEUR_MODERATEUR, 'Administrateur - Modérateur'),
    ]
    
    # Champs
    nom = models.CharField(
        max_length=100,
        unique=True,
        choices=TYPE_ROLE_CHOICES,
        verbose_name="Nom du rôle"
    )
    description = models.TextField(
        blank=True,
        verbose_name="Description"
    )
    
    # Permissions (pour extension future)
    peut_gerer_vehicules = models.BooleanField(default=False)
    peut_gerer_concessions = models.BooleanField(default=False)
    peut_gerer_utilisateurs = models.BooleanField(default=False)
    peut_voir_statistiques = models.BooleanField(default=False)
    peut_moderer_contenu = models.BooleanField(default=False)
    
    # Métadonnées
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Rôle"
        verbose_name_plural = "Rôles"
        ordering = ['nom']
    
    def __str__(self):
        return self.get_nom_display()


# ========================================
# GESTIONNAIRE D'UTILISATEURS PERSONNALISÉ
# ========================================

class UtilisateurManager(BaseUserManager):
    """
    Gestionnaire personnalisé pour le modèle Utilisateur.
    Gère la création d'utilisateurs et de superutilisateurs.
    """
    
    def create_user(self, email, password=None, **extra_fields):
        """Créer et sauvegarder un utilisateur normal."""
        if not email:
            raise ValueError("L'adresse email est obligatoire")
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Créer et sauvegarder un superutilisateur."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('type_utilisateur', 'ADMINISTRATEUR')
        extra_fields.setdefault('niveau_acces', 'SUPER')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Le superutilisateur doit avoir is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Le superutilisateur doit avoir is_superuser=True.')
        
        # Attribuer le rôle ADMINISTRATEUR_SUPER
        if 'role' not in extra_fields:
            try:
                role_admin = Role.objects.get(nom='ADMINISTRATEUR_SUPER')
                extra_fields['role'] = role_admin
            except Role.DoesNotExist:
                raise ValueError('Le rôle ADMINISTRATEUR_SUPER doit exister avant de créer un superuser.')
        

        return self.create_user(email, password, **extra_fields)


# ========================================
# MODÈLE UTILISATEUR ABSTRAIT
# ========================================

class User(AbstractBaseUser, PermissionsMixin):
    """
    Modèle utilisateur de base abstrait.
    Contient tous les champs communs à tous les types d'utilisateurs.
    """
    
    # Validation numéro de téléphone
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Le numéro de téléphone doit être au format: '+999999999'. Maximum 15 chiffres."
    )
    
    # Champs d'authentification
    email = models.EmailField(
        unique=True,
        verbose_name="Adresse email"
    )
    
    # Informations personnelles
    nom = models.CharField(max_length=150, verbose_name="Nom")
    prenom = models.CharField(max_length=150, verbose_name="Prénom")
    
    telephone = models.CharField(
        validators=[phone_regex],
        max_length=17,
        blank=True,
        verbose_name="Téléphone"
    )
    
    adresse = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Adresse"
    )
    
    ville = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Ville"
    )
    
    code_postal = models.CharField(
        max_length=10,
        blank=True,
        verbose_name="Code postal"
    )
    
    photo_profil = models.ImageField(
        upload_to='profils/',
        blank=True,
        null=True,
        verbose_name="Photo de profil"
    )
    
    # Relation avec Role
    role = models.ForeignKey(
        Role,
        on_delete=models.PROTECT,
        related_name='utilisateurs',
        verbose_name="Rôle"
    )

    # Type d'utilisateur (pour différencier Client/Concessionnaire/Admin)
    TYPE_UTILISATEUR_CHOICES = [
        ('CLIENT', 'Client'),
        ('CONCESSIONNAIRE', 'Concessionnaire'),
        ('ADMINISTRATEUR', 'Administrateur'),
    ]
    
    type_utilisateur = models.CharField(
        max_length=50,
        choices=TYPE_UTILISATEUR_CHOICES,
        default='CLIENT',
        verbose_name="Type d'utilisateur"
    )
    
# ========================================
    # CHAMPS SPÉCIFIQUES CLIENT
    # ========================================
    
    preferences_notifications = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Préférences de notifications"
    )
    
    newsletter_acceptee = models.BooleanField(
        default=False,
        verbose_name="Newsletter acceptée"
    )
    
    # ========================================
    # CHAMPS SPÉCIFIQUES CONCESSIONNAIRE
    # ========================================
    
    nom_entreprise = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Nom de l'entreprise"
    )
    
    siret = models.CharField(
        max_length=14,
        blank=True,
        null=True,
        validators=[
            RegexValidator(
                regex=r'^\d{14}$',
                message="Le SIRET doit contenir exactement 14 chiffres"
            )
        ],
        verbose_name="SIRET"
    )
    
    site_web = models.URLField(
        blank=True,
        verbose_name="Site web"
    )
    
    logo_entreprise = models.ImageField(
        upload_to='logos/',
        blank=True,
        null=True,
        verbose_name="Logo de l'entreprise"
    )
    
    description_entreprise = models.TextField(
        blank=True,
        verbose_name="Description de l'entreprise"
    )
    
    est_valide = models.BooleanField(
        default=False,
        verbose_name="Compte validé"
    )
    
    date_validation = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date de validation"
    )
    
    # ========================================
    # NOUVEAU : SYSTÈME DE PROGRESSION DU PROFIL
    # ========================================
    
    STATUT_COMPTE_CHOICES = [
        ('INCOMPLETE', 'Profil incomplet'),
        ('EN_ATTENTE_VALIDATION', 'En attente de validation'),
        ('VALIDE', 'Validé'),
        ('REJETE', 'Rejeté'),
    ]
    
    statut_compte = models.CharField(
        max_length=50,
        choices=STATUT_COMPTE_CHOICES,
        default='INCOMPLETE',
        verbose_name="Statut du compte"
    )
    
    pourcentage_completion = models.IntegerField(
        default=0,
        verbose_name="Pourcentage de complétion du profil",
        help_text="Calculé automatiquement selon les champs remplis"
    )
    
    raison_rejet = models.TextField(
        blank=True,
        verbose_name="Raison du rejet",
        help_text="Raison pour laquelle le compte a été rejeté par l'administrateur"
    )


    # ========================================
    # CHAMPS SPÉCIFIQUES ADMINISTRATEUR
    # ========================================
    
    niveau_acces = models.CharField(
        max_length=50,
        choices=[
            ('SUPER', 'Super Administrateur'),
            ('MODERATEUR', 'Modérateur'),
            ('SUPPORT', 'Support Client'),
        ],
        blank=True,
        verbose_name="Niveau d'accès"
    )
    
    peut_valider_concessionnaires = models.BooleanField(
        default=False,
        verbose_name="Peut valider les concessionnaires"
    )
    
    peut_supprimer_utilisateurs = models.BooleanField(
        default=False,
        verbose_name="Peut supprimer des utilisateurs"
    )

    # Statuts
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    is_staff = models.BooleanField(default=False, verbose_name="Staff")
    is_verified = models.BooleanField(default=False, verbose_name="Email vérifié")
    
    # Dates
    date_inscription = models.DateTimeField(auto_now_add=True, verbose_name="Date d'inscription")
    date_modification = models.DateTimeField(auto_now=True, verbose_name="Dernière modification")
    derniere_connexion = models.DateTimeField(null=True, blank=True, verbose_name="Dernière connexion")
    
    # Configuration du gestionnaire
    objects = UtilisateurManager()
    
    # Champ utilisé pour l'authentification
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nom', 'prenom']

    def is_client(self):
        """Vérifie si l'utilisateur est un client."""
        return self.type_utilisateur == 'CLIENT'
    
    def is_concessionnaire(self):
        """Vérifie si l'utilisateur est un concessionnaire."""
        return self.type_utilisateur == 'CONCESSIONNAIRE'
    
    def is_administrateur(self):
        """Vérifie si l'utilisateur est un administrateur."""
        return self.type_utilisateur == 'ADMINISTRATEUR'
    

    # ========================================
    # MÉTHODES DE CALCUL DE PROGRESSION
    # ========================================
    
    def calculer_completion_client(self):
        """Calculer le pourcentage de complétion pour un client."""
        total_points = 6
        points = 0
        
        # Champs de base (toujours remplis à l'inscription)
        if self.email and self.nom and self.prenom:
            points += 3  # 50%
        
        # Champs optionnels
        if self.telephone:
            points += 1
        if self.adresse and self.ville:
            points += 1
        if self.photo_profil:
            points += 1
        
        return int((points / total_points) * 100)
    
    def calculer_completion_concessionnaire(self):
        """Calculer le pourcentage de complétion pour un concessionnaire."""
        total_points = 10
        points = 0
        
        # Informations de base (20%)
        if self.email and self.nom and self.prenom:
            points += 2
        
        # Informations personnelles (20%)
        if self.telephone:
            points += 1
        if self.adresse and self.ville:
            points += 1
        
        # Informations entreprise (40%)
        if self.nom_entreprise:
            points += 2
        if self.siret:
            points += 2
        
        # Documents/Logo (20%)
        if self.logo_entreprise:
            points += 1
        if self.description_entreprise:
            points += 1
        
        return int((points / total_points) * 100)
    
    def calculer_completion(self):
        """Calculer le pourcentage de complétion selon le type d'utilisateur."""
        if self.type_utilisateur == 'CLIENT':
            return self.calculer_completion_client()
        elif self.type_utilisateur == 'CONCESSIONNAIRE':
            return self.calculer_completion_concessionnaire()
        else:
            return 100  # Admin toujours à 100%
    
    def mettre_a_jour_statut(self):
        """Mettre à jour automatiquement le statut du compte."""
        if self.type_utilisateur == 'CLIENT':
            # Les clients n'ont pas besoin de validation
            self.statut_compte = 'VALIDE'
        
        elif self.type_utilisateur == 'CONCESSIONNAIRE':
            pourcentage = self.calculer_completion()
            
            if pourcentage < 70:
                # Profil incomplet
                self.statut_compte = 'INCOMPLETE'
            elif pourcentage >= 70 and not self.est_valide:
                # Profil complet mais pas validé
                self.statut_compte = 'EN_ATTENTE_VALIDATION'
            elif self.est_valide:
                # Validé par l'admin
                self.statut_compte = 'VALIDE'
        
        else:  # ADMINISTRATEUR
            self.statut_compte = 'VALIDE'
    
    def save(self, *args, **kwargs):
        """Surcharge de save pour mettre à jour automatiquement la progression."""
        # Calculer le pourcentage de complétion
        self.pourcentage_completion = self.calculer_completion()
        
        # Mettre à jour le statut
        self.mettre_a_jour_statut()
        
        # Sauvegarder
        super().save(*args, **kwargs)
    
    def get_etapes_manquantes(self):
        """Retourner la liste des étapes manquantes pour compléter le profil."""
        etapes = []
        
        if self.type_utilisateur == 'CONCESSIONNAIRE':
            if not self.telephone:
                etapes.append({
                    'titre': 'Ajouter votre téléphone',
                    'importance': 'Moyenne',
                    'points': '+10%'
                })
            
            if not (self.adresse and self.ville):
                etapes.append({
                    'titre': 'Compléter votre adresse',
                    'importance': 'Moyenne',
                    'points': '+10%'
                })
            
            if not self.nom_entreprise:
                etapes.append({
                    'titre': 'Ajouter le nom de votre entreprise',
                    'importance': 'Haute',
                    'points': '+20%'
                })
            
            if not self.siret:
                etapes.append({
                    'titre': 'Ajouter votre numéro SIRET',
                    'importance': 'Haute',
                    'points': '+20%'
                })
            
            if not self.logo_entreprise:
                etapes.append({
                    'titre': 'Ajouter le logo de votre entreprise',
                    'importance': 'Basse',
                    'points': '+10%'
                })
            
            if not self.description_entreprise:
                etapes.append({
                    'titre': 'Ajouter une description de votre entreprise',
                    'importance': 'Basse',
                    'points': '+10%'
                })
        
        elif self.type_utilisateur == 'CLIENT':
            if not self.telephone:
                etapes.append({
                    'titre': 'Ajouter votre téléphone',
                    'importance': 'Moyenne',
                    'points': '+17%'
                })
            
            if not (self.adresse and self.ville):
                etapes.append({
                    'titre': 'Compléter votre adresse',
                    'importance': 'Moyenne',
                    'points': '+17%'
                })
            
            if not self.photo_profil:
                etapes.append({
                    'titre': 'Ajouter une photo de profil',
                    'importance': 'Basse',
                    'points': '+16%'
                })
        
        return etapes
    
    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        ordering = ['-date_inscription']
    
    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.email})"
    
    def get_full_name(self):
        """Retourne le nom complet de l'utilisateur."""
        return f"{self.prenom} {self.nom}"
    
    def get_short_name(self):
        """Retourne le prénom de l'utilisateur."""
        return self.prenom
    

    # ========================================

'''

class Utilisateur_Concession(models.Model):
    """
    Table associative entre Utilisateurs et Concessions.
    Permet de gérer l'affectation des employés aux concessions.
    """
    
    # Relations
    utilisateur = models.ForeignKey(
        'User',  # Seulement les concessionnaires peuvent être affectés
        on_delete=models.CASCADE,
        related_name='affectations_concessions',
        verbose_name="Utilisateur",
        limit_choices_to={
            'type_utilisateur': 'CONCESSIONNAIRE'
        }
    )
    
    # Note: On va importer Concession plus tard (dans l'app concessions)
    # Pour l'instant, on utilise une chaîne pour référence différée
    concession = models.ForeignKey(
        'concessions.Concession',  # Référence différée
        on_delete=models.CASCADE,
        related_name='affectations_utilisateurs',
        verbose_name="Concession"
    )
    
    # Rôle dans cette concession spécifique
    role_concession = models.CharField(
        max_length=50,
        choices=[
            ('PROPRIETAIRE', 'Propriétaire'),
            ('GERANT', 'Gérant'),
            ('EMPLOYE', 'Employé'),
        ],
        default='EMPLOYE',
        verbose_name="Rôle dans la concession"
    )
    
    # Dates
    date_affectation = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date d'affectation"
    )
    
    date_fin_affectation = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date de fin d'affectation"
    )
    
    est_actif = models.BooleanField(
        default=True,
        verbose_name="Affectation active"
    )
    
    class Meta:
        verbose_name = "Affectation Utilisateur-Concession"
        verbose_name_plural = "Affectations Utilisateur-Concession"
        unique_together = ['utilisateur', 'concession']  # Un utilisateur = 1 rôle par concession
        ordering = ['-date_affectation']
    
    def __str__(self):
        return f"{self.utilisateur.get_full_name()} - {self.concession} ({self.role_concession})"

'''