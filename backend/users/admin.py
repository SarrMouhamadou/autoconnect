from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, Role


# ========================================
# ADMIN ROLE
# ========================================

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    """Administration des rôles."""
    
    list_display = [
        'id', 'nom', 'description',
        'peut_gerer_vehicules', 'peut_gerer_concessions',
        'peut_gerer_utilisateurs', 'date_creation'
    ]
    list_filter = [
        'peut_gerer_vehicules',
        'peut_gerer_concessions',
        'peut_gerer_utilisateurs',
        'peut_voir_statistiques',
        'peut_moderer_contenu'
    ]
    search_fields = ['nom', 'description']
    readonly_fields = ['date_creation', 'date_modification']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('nom', 'description')
        }),
        ('Permissions', {
            'fields': (
                'peut_gerer_vehicules',
                'peut_gerer_concessions',
                'peut_gerer_utilisateurs',
                'peut_voir_statistiques',
                'peut_moderer_contenu'
            )
        }),
        ('Métadonnées', {
            'fields': ('date_creation', 'date_modification'),
            'classes': ('collapse',)
        }),
    )


# ========================================
# ADMIN USER
# ========================================

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Administration des utilisateurs."""
    
    # Colonnes affichées dans la liste
    list_display = [
        'id', 'email', 'get_full_name_display', 'type_utilisateur',
        'role', 'is_active', 'is_verified', 'get_validation_status',
        'date_inscription'
    ]
    
    list_filter = [
        'type_utilisateur', 'role', 'is_active',
        'is_verified', 'est_valide', 'is_staff', 'is_superuser'
    ]
    
    search_fields = ['email', 'nom', 'prenom', 'nom_entreprise', 'siret']
    
    ordering = ['-date_inscription']
    
    readonly_fields = [
        'date_inscription', 'date_modification',
        'derniere_connexion', 'password'
    ]
    
    # Colonnes personnalisées
    def get_full_name_display(self, obj):
        """Afficher le nom complet."""
        return obj.get_full_name()
    get_full_name_display.short_description = 'Nom complet'
    
    def get_validation_status(self, obj):
        """Afficher le statut de validation avec couleur."""
        if obj.type_utilisateur == 'CONCESSIONNAIRE':
            if obj.est_valide:
                return format_html(
                    '<span style="color: green; font-weight: bold;">✅ Validé</span>'
                )
            else:
                return format_html(
                    '<span style="color: orange; font-weight: bold;">⏳ En attente</span>'
                )
        return format_html('<span style="color: gray;">N/A</span>')
    get_validation_status.short_description = 'Validation'
    
    # Organisation des champs dans le formulaire d'édition
    fieldsets = (
        ('Authentification', {
            'fields': ('email', 'password')
        }),
        ('Informations personnelles', {
            'fields': ('prenom', 'nom', 'telephone', 'photo_profil')
        }),
        ('Adresse', {
            'fields': ('adresse', 'ville', 'code_postal'),
            'classes': ('collapse',)
        }),
        ('Type et rôle', {
            'fields': ('type_utilisateur', 'role')
        }),
        ('Informations Concessionnaire', {
            'fields': (
                'nom_entreprise', 'siret', 'site_web',
                'logo_entreprise', 'description_entreprise',
                'est_valide', 'date_validation'
            ),
            'classes': ('collapse',)
        }),
        ('Informations Administrateur', {
            'fields': (
                'niveau_acces',
                'peut_valider_concessionnaires',
                'peut_supprimer_utilisateurs'
            ),
            'classes': ('collapse',)
        }),
        ('Préférences Client', {
            'fields': ('newsletter_acceptee', 'preferences_notifications'),
            'classes': ('collapse',)
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'is_verified'),
        }),
        ('Dates importantes', {
            'fields': ('date_inscription', 'date_modification', 'derniere_connexion'),
            'classes': ('collapse',)
        }),
    )
    
    # Champs affichés lors de la création d'un utilisateur
    add_fieldsets = (
        ('Authentification', {
            'fields': ('email', 'password1', 'password2')
        }),
        ('Informations personnelles', {
            'fields': ('prenom', 'nom', 'telephone')
        }),
        ('Type et rôle', {
            'fields': ('type_utilisateur', 'role')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser')
        }),
    )
    
    # Actions personnalisées
    actions = ['valider_concessionnaires', 'activer_utilisateurs', 'desactiver_utilisateurs']
    
    def valider_concessionnaires(self, request, queryset):
        """Valider les comptes concessionnaires sélectionnés."""
        from django.utils import timezone
        
        count = 0
        for user in queryset:
            if user.type_utilisateur == 'CONCESSIONNAIRE' and not user.est_valide:
                user.est_valide = True
                user.date_validation = timezone.now()
                user.save()
                count += 1
        
        self.message_user(
            request,
            f'{count} concessionnaire(s) validé(s) avec succès.'
        )
    valider_concessionnaires.short_description = "✅ Valider les concessionnaires sélectionnés"
    
    def activer_utilisateurs(self, request, queryset):
        """Activer les utilisateurs sélectionnés."""
        count = queryset.update(is_active=True)
        self.message_user(
            request,
            f'{count} utilisateur(s) activé(s) avec succès.'
        )
    activer_utilisateurs.short_description = "✅ Activer les utilisateurs sélectionnés"
    
    def desactiver_utilisateurs(self, request, queryset):
        """Désactiver les utilisateurs sélectionnés."""
        count = queryset.update(is_active=False)
        self.message_user(
            request,
            f'{count} utilisateur(s) désactivé(s) avec succès.'
        )
    desactiver_utilisateurs.short_description = "❌ Désactiver les utilisateurs sélectionnés"