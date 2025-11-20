from django.contrib import admin
from .models import Region, Concession


# ========================================
# ADMIN RÉGION
# ========================================

@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    """
    Configuration de l'admin pour le modèle Region.
    """
    
    list_display = [
        'nom',
        'code',
        'nombre_concessions',
        'latitude',
        'longitude',
        'date_creation'
    ]
    
    list_filter = ['date_creation']
    
    search_fields = ['nom', 'code', 'description']
    
    readonly_fields = ['nombre_concessions', 'date_creation', 'date_modification']
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('nom', 'code', 'description')
        }),
        ('Géolocalisation', {
            'fields': ('latitude', 'longitude')
        }),
        ('Statistiques', {
            'fields': ('nombre_concessions',),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('date_creation', 'date_modification'),
            'classes': ('collapse',)
        }),
    )


# ========================================
# ADMIN CONCESSION
# ========================================

@admin.register(Concession)
class ConcessionAdmin(admin.ModelAdmin):
    """
    Configuration de l'admin pour le modèle Concession.
    """
    
    list_display = [
        'nom',
        'ville',
        'region',
        'concessionnaire',
        'statut',
        'nombre_vehicules',
        'note_moyenne',
        'est_visible',
        'date_creation'
    ]
    
    list_filter = [
        'statut',
        'est_visible',
        'region',
        'ouvert_weekend',
        'date_creation',
        'date_validation'
    ]
    
    search_fields = [
        'nom',
        'ville',
        'adresse',
        'email',
        'numero_registre_commerce',
        'concessionnaire__nom',
        'concessionnaire__prenom',
        'concessionnaire__email'
    ]
    
    readonly_fields = [
        'concessionnaire',
        'nombre_vehicules',
        'note_moyenne',
        'nombre_avis',
        'nombre_vues',
        'date_creation',
        'date_modification',
        'date_validation',
        'validee_par'
    ]
    
    autocomplete_fields = ['region']
    
    fieldsets = (
        ('Informations de base', {
            'fields': (
                'nom',
                'description',
                'concessionnaire',
                'region'
            )
        }),
        ('Coordonnées', {
            'fields': (
                'adresse',
                'ville',
                'code_postal',
                'telephone',
                'telephone_secondaire',
                'email',
                'site_web'
            )
        }),
        ('Géolocalisation', {
            'fields': (
                'latitude',
                'longitude'
            )
        }),
        ('Horaires et Services', {
            'fields': (
                'horaires',
                'ouvert_weekend',
                'services'
            ),
            'classes': ('collapse',)
        }),
        ('Informations commerciales', {
            'fields': (
                'numero_registre_commerce',
                'logo',
                'photo_facade'
            )
        }),
        ('Statut et validation', {
            'fields': (
                'statut',
                'date_validation',
                'validee_par',
                'raison_rejet',
                'est_visible'
            )
        }),
        ('Statistiques', {
            'fields': (
                'nombre_vehicules',
                'note_moyenne',
                'nombre_avis',
                'nombre_vues'
            ),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': (
                'date_creation',
                'date_modification'
            ),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['valider_concessions', 'suspendre_concessions', 'activer_visibilite', 'desactiver_visibilite']
    
    def valider_concessions(self, request, queryset):
        """Action pour valider plusieurs concessions en masse."""
        from django.utils import timezone
        
        updated = queryset.filter(
            statut__in=['EN_ATTENTE', 'REJETE', 'SUSPENDU']
        ).update(
            statut='VALIDE',
            date_validation=timezone.now(),
            validee_par=request.user
        )
        
        self.message_user(
            request,
            f'{updated} concession(s) validée(s) avec succès.'
        )
    
    valider_concessions.short_description = "Valider les concessions sélectionnées"
    
    def suspendre_concessions(self, request, queryset):
        """Action pour suspendre plusieurs concessions en masse."""
        updated = queryset.update(statut='SUSPENDU')
        
        self.message_user(
            request,
            f'{updated} concession(s) suspendue(s) avec succès.'
        )
    
    suspendre_concessions.short_description = "Suspendre les concessions sélectionnées"
    
    def activer_visibilite(self, request, queryset):
        """Action pour activer la visibilité de plusieurs concessions."""
        updated = queryset.update(est_visible=True)
        
        self.message_user(
            request,
            f'{updated} concession(s) rendue(s) visible(s).'
        )
    
    activer_visibilite.short_description = "Rendre visible"
    
    def desactiver_visibilite(self, request, queryset):
        """Action pour désactiver la visibilité de plusieurs concessions."""
        updated = queryset.update(est_visible=False)
        
        self.message_user(
            request,
            f'{updated} concession(s) masquée(s).'
        )
    
    desactiver_visibilite.short_description = "Masquer"