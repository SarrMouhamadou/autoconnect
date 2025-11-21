# backend/vehicules/admin.py - ADMIN COMPLET

from django.contrib import admin
from django.utils.html import format_html
from .models import Marque, Categorie, Vehicule, ImageVehicule


# ========================================
# ADMIN MARQUE
# ========================================

@admin.register(Marque)
class MarqueAdmin(admin.ModelAdmin):
    """
    Interface d'administration pour les marques.
    """
    
    list_display = [
        'nom',
        'logo_preview',
        'pays_origine',
        'nombre_vehicules',
        'est_active',
        'date_creation'
    ]
    
    list_filter = [
        'est_active',
        'pays_origine',
        'date_creation'
    ]
    
    search_fields = [
        'nom',
        'pays_origine',
        'description'
    ]
    
    readonly_fields = [
        'nombre_vehicules',
        'date_creation',
        'date_modification',
        'logo_preview_large'
    ]
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('nom', 'description', 'pays_origine')
        }),
        ('Logo', {
            'fields': ('logo', 'logo_preview_large')
        }),
        ('Contact', {
            'fields': ('site_web',)
        }),
        ('Statut', {
            'fields': ('est_active', 'nombre_vehicules')
        }),
        ('Dates', {
            'fields': ('date_creation', 'date_modification'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['activer_marques', 'desactiver_marques', 'mettre_a_jour_compteurs']
    
    def logo_preview(self, obj):
        """Afficher une miniature du logo."""
        if obj.logo:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: contain;" />',
                obj.logo.url
            )
        return '-'
    logo_preview.short_description = 'Logo'
    
    def logo_preview_large(self, obj):
        """Afficher une grande prévisualisation du logo."""
        if obj.logo:
            return format_html(
                '<img src="{}" style="max-width: 200px; max-height: 200px; object-fit: contain;" />',
                obj.logo.url
            )
        return 'Aucun logo'
    logo_preview_large.short_description = 'Prévisualisation'
    
    def activer_marques(self, request, queryset):
        """Activer les marques sélectionnées."""
        count = queryset.update(est_active=True)
        self.message_user(request, f'{count} marque(s) activée(s).')
    activer_marques.short_description = 'Activer les marques sélectionnées'
    
    def desactiver_marques(self, request, queryset):
        """Désactiver les marques sélectionnées."""
        count = queryset.update(est_active=False)
        self.message_user(request, f'{count} marque(s) désactivée(s).')
    desactiver_marques.short_description = 'Désactiver les marques sélectionnées'
    
    def mettre_a_jour_compteurs(self, request, queryset):
        """Mettre à jour les compteurs de véhicules."""
        for marque in queryset:
            marque.mettre_a_jour_compteur()
        self.message_user(request, f'Compteurs mis à jour pour {queryset.count()} marque(s).')
    mettre_a_jour_compteurs.short_description = 'Mettre à jour les compteurs'


# ========================================
# ADMIN CATÉGORIE
# ========================================

@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    """
    Interface d'administration pour les catégories.
    """
    
    list_display = [
        'nom',
        'slug',
        'icone',
        'image_preview',
        'ordre',
        'nombre_vehicules',
        'est_active',
        'date_creation'
    ]
    
    list_filter = [
        'est_active',
        'date_creation'
    ]
    
    search_fields = [
        'nom',
        'slug',
        'description'
    ]
    
    readonly_fields = [
        'slug',
        'nombre_vehicules',
        'date_creation',
        'date_modification',
        'image_preview_large'
    ]
    
    prepopulated_fields = {
        'slug': ('nom',)
    }
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('nom', 'slug', 'description')
        }),
        ('Apparence', {
            'fields': ('icone', 'image', 'image_preview_large', 'ordre')
        }),
        ('Statut', {
            'fields': ('est_active', 'nombre_vehicules')
        }),
        ('Dates', {
            'fields': ('date_creation', 'date_modification'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['activer_categories', 'desactiver_categories', 'mettre_a_jour_compteurs']
    
    def image_preview(self, obj):
        """Afficher une miniature de l'image."""
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: cover;" />',
                obj.image.url
            )
        return '-'
    image_preview.short_description = 'Image'
    
    def image_preview_large(self, obj):
        """Afficher une grande prévisualisation de l'image."""
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width: 300px; max-height: 200px; object-fit: contain;" />',
                obj.image.url
            )
        return 'Aucune image'
    image_preview_large.short_description = 'Prévisualisation'
    
    def activer_categories(self, request, queryset):
        """Activer les catégories sélectionnées."""
        count = queryset.update(est_active=True)
        self.message_user(request, f'{count} catégorie(s) activée(s).')
    activer_categories.short_description = 'Activer les catégories sélectionnées'
    
    def desactiver_categories(self, request, queryset):
        """Désactiver les catégories sélectionnées."""
        count = queryset.update(est_active=False)
        self.message_user(request, f'{count} catégorie(s) désactivée(s).')
    desactiver_categories.short_description = 'Désactiver les catégories sélectionnées'
    
    def mettre_a_jour_compteurs(self, request, queryset):
        """Mettre à jour les compteurs de véhicules."""
        for categorie in queryset:
            categorie.mettre_a_jour_compteur()
        self.message_user(request, f'Compteurs mis à jour pour {queryset.count()} catégorie(s).')
    mettre_a_jour_compteurs.short_description = 'Mettre à jour les compteurs'


# ========================================
# INLINE IMAGES VÉHICULE
# ========================================

class ImageVehiculeInline(admin.TabularInline):
    """Inline pour gérer les images supplémentaires d'un véhicule."""
    model = ImageVehicule
    extra = 1
    fields = ['image', 'image_preview', 'description', 'ordre']
    readonly_fields = ['image_preview']
    
    def image_preview(self, obj):
        """Prévisualisation de l'image."""
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 100px; height: 75px; object-fit: cover;" />',
                obj.image.url
            )
        return '-'
    image_preview.short_description = 'Aperçu'


# ========================================
# ADMIN VÉHICULE (MISE À JOUR)
# ========================================

@admin.register(Vehicule)
class VehiculeAdmin(admin.ModelAdmin):
    """
    Interface d'administration pour les véhicules.
    ⭐ CONFORME AU DIAGRAMME - Inclut Marque, Catégorie, Concession
    """
    
    list_display = [
        'nom_complet',
        'marque',
        'categorie',
        'concession',
        'annee',
        'prix_location_jour',
        'statut',
        'est_visible',
        'date_ajout'
    ]
    
    list_filter = [
        'marque',
        'categorie',
        'concession',
        'type_carburant',
        'transmission',
        'statut',
        'est_disponible_vente',
        'est_disponible_location',
        'est_visible',
        'date_ajout'
    ]
    
    search_fields = [
        'nom_modele',
        'immatriculation',
        'marque__nom',
        'categorie__nom',
        'concession__nom',
        'description'
    ]
    
    readonly_fields = [
        'nom_complet',
        'nombre_vues',
        'nombre_locations',
        'note_moyenne',
        'nombre_avis',
        'date_ajout',
        'date_modification',
        'image_preview'
    ]
    
    autocomplete_fields = ['marque', 'categorie', 'concession']
    
    fieldsets = (
        ('Relations', {
            'fields': ('concessionnaire', 'concession', 'marque', 'categorie')
        }),
        ('Informations de base', {
            'fields': (
                'nom_modele',
                'nom_complet',
                'annee',
                'immatriculation',
                'couleur'
            )
        }),
        ('Caractéristiques techniques', {
            'fields': (
                'type_carburant',
                'transmission',
                'nombre_places',
                'nombre_portes',
                'climatisation',
                'kilometrage',
                'puissance_fiscale',
                'cylindree'
            )
        }),
        ('Disponibilité et tarifs', {
            'fields': (
                'est_disponible_vente',
                'est_disponible_location',
                'prix_vente',
                'prix_location_jour',
                'caution'
            )
        }),
        ('Description et équipements', {
            'fields': ('description', 'equipements')
        }),
        ('Images', {
            'fields': ('image_principale', 'image_preview')
        }),
        ('Statut', {
            'fields': ('statut', 'est_visible')
        }),
        ('Maintenance', {
            'fields': ('derniere_maintenance', 'prochaine_maintenance'),
            'classes': ('collapse',)
        }),
        ('Statistiques', {
            'fields': (
                'nombre_vues',
                'nombre_locations',
                'note_moyenne',
                'nombre_avis'
            ),
            'classes': ('collapse',)
        }),
        ('Dates', {
            'fields': ('date_ajout', 'date_modification'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [ImageVehiculeInline]
    
    actions = ['rendre_disponible', 'rendre_indisponible', 'masquer', 'afficher']
    
    def image_preview(self, obj):
        """Prévisualisation de l'image principale."""
        if obj.image_principale:
            return format_html(
                '<img src="{}" style="max-width: 300px; max-height: 200px; object-fit: contain;" />',
                obj.image_principale.url
            )
        return 'Aucune image'
    image_preview.short_description = 'Prévisualisation'
    
    def rendre_disponible(self, request, queryset):
        """Rendre les véhicules disponibles."""
        count = queryset.update(statut='DISPONIBLE')
        self.message_user(request, f'{count} véhicule(s) rendu(s) disponible(s).')
    rendre_disponible.short_description = 'Rendre disponible'
    
    def rendre_indisponible(self, request, queryset):
        """Rendre les véhicules indisponibles."""
        count = queryset.update(statut='INDISPONIBLE')
        self.message_user(request, f'{count} véhicule(s) rendu(s) indisponible(s).')
    rendre_indisponible.short_description = 'Rendre indisponible'
    
    def masquer(self, request, queryset):
        """Masquer les véhicules."""
        count = queryset.update(est_visible=False)
        self.message_user(request, f'{count} véhicule(s) masqué(s).')
    masquer.short_description = 'Masquer'
    
    def afficher(self, request, queryset):
        """Afficher les véhicules."""
        count = queryset.update(est_visible=True)
        self.message_user(request, f'{count} véhicule(s) affiché(s).')
    afficher.short_description = 'Afficher'


# ========================================
# ADMIN IMAGE VÉHICULE
# ========================================

@admin.register(ImageVehicule)
class ImageVehiculeAdmin(admin.ModelAdmin):
    """Interface d'administration pour les images de véhicules."""
    
    list_display = ['vehicule', 'image_preview', 'description', 'ordre', 'date_ajout']
    list_filter = ['date_ajout']
    search_fields = ['vehicule__nom_modele', 'description']
    readonly_fields = ['date_ajout', 'image_preview_large']
    
    fieldsets = (
        ('Véhicule', {
            'fields': ('vehicule',)
        }),
        ('Image', {
            'fields': ('image', 'image_preview_large', 'description', 'ordre')
        }),
        ('Date', {
            'fields': ('date_ajout',)
        }),
    )
    
    def image_preview(self, obj):
        """Miniature."""
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 100px; height: 75px; object-fit: cover;" />',
                obj.image.url
            )
        return '-'
    image_preview.short_description = 'Image'
    
    def image_preview_large(self, obj):
        """Grande prévisualisation."""
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width: 400px; max-height: 300px; object-fit: contain;" />',
                obj.image.url
            )
        return 'Aucune image'
    image_preview_large.short_description = 'Prévisualisation'