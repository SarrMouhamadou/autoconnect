from django.contrib import admin
from django.utils.html import format_html
from .models import Vehicule, ImageVehicule, Equipement


# ========================================
# INLINE POUR IMAGES
# ========================================

class ImageVehiculeInline(admin.TabularInline):
    """Inline pour gérer les images supplémentaires d'un véhicule."""
    model = ImageVehicule
    extra = 1
    fields = ['image', 'description', 'ordre']
    readonly_fields = ['date_ajout']


# ========================================
# ADMIN VÉHICULE
# ========================================

@admin.register(Vehicule)
class VehiculeAdmin(admin.ModelAdmin):
    """Administration des véhicules."""
    
    # Inline pour les images
    inlines = [ImageVehiculeInline]
    
    # Colonnes affichées dans la liste
    list_display = [
        'id', 'get_image_preview', 'get_nom_complet_display', 
        'concessionnaire', 'type_vehicule', 'get_prix_display',
        'statut','prix_vente', 'nombre_locations',
        'get_note_display', 'date_ajout','disponibilite_vente','disponibilite_location'
    ]
    
    list_filter = [
        'statut', 'est_disponible_vente','est_disponible_location', 'type_vehicule', 
        'type_carburant', 'transmission', 'marque',
        'date_ajout'
    ]
    
    search_fields = [
        'marque', 'modele', 'immatriculation', 
        'concessionnaire__nom_entreprise', 'concessionnaire__email'
    ]
    
    ordering = ['-date_ajout']
    
    readonly_fields = [
        'date_ajout', 'date_modification', 'nombre_locations',
        'note_moyenne', 'nombre_avis', 'get_image_preview_large'
    ]
    
    # Organisation des champs dans le formulaire
    fieldsets = (
        ('Propriétaire', {
            'fields': ('concessionnaire',)
        }),
        ('Informations de base', {
            'fields': (
                'marque', 'modele', 'annee', 'type_vehicule',
                'couleur', 'immatriculation'
            )
        }),
        ('Caractéristiques techniques', {
            'fields': (
                'type_carburant', 'transmission', 'nombre_places',
                'nombre_portes', 'climatisation', 'kilometrage'
            )
        }),
        ('Type d\'offre', {
        'fields': ('est_disponible_vente', 'est_disponible_location')  
        }),
        ('Tarification', {
            'fields': ('prix_location_jour','prix_vente', 'caution')
        }),
        ('Description et équipements', {
            'fields': ('description', 'equipements')
        }),
        ('Images', {
            'fields': ('image_principale', 'get_image_preview_large')
        }),
        ('Disponibilité', {
            'fields': ('statut', 'est_disponible')
        }),
        ('Maintenance', {
            'fields': ('derniere_maintenance', 'prochaine_maintenance'),
            'classes': ('collapse',)
        }),
        ('Statistiques', {
            'fields': (
                'nombre_locations', 'note_moyenne', 'nombre_avis'
            ),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('date_ajout', 'date_modification'),
            'classes': ('collapse',)
        }),
    )
    
    # Colonnes personnalisées
    
    def get_image_preview(self, obj):
        """Afficher une miniature de l'image principale."""
        if obj.image_principale:
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit: cover; border-radius: 4px;" />',
                obj.image_principale.url
            )
        return format_html('<span style="color: gray;">Aucune image</span>')
    get_image_preview.short_description = 'Image'
    
    def get_image_preview_large(self, obj):
        """Afficher une grande prévisualisation de l'image."""
        if obj.image_principale:
            return format_html(
                '<img src="{}" width="300" style="border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />',
                obj.image_principale.url
            )
        return format_html('<span style="color: gray;">Aucune image</span>')
    get_image_preview_large.short_description = 'Prévisualisation'
    
    def get_nom_complet_display(self, obj):
        """Afficher le nom complet du véhicule avec style."""
        return format_html(
            '<strong>{}</strong><br/><span style="color: gray; font-size: 11px;">{}</span>',
            obj.get_nom_complet(),
            obj.immatriculation
        )
    get_nom_complet_display.short_description = 'Véhicule'
    
    def get_prix_display(self, obj):
        """Afficher le prix avec style."""
        return format_html(
            '<strong style="color: #059669;">{:,.0f} FCFA</strong><br/>'
            '<span style="color: gray; font-size: 11px;">par jour</span>',
            obj.prix_location_jour
        )
    get_prix_display.short_description = 'Prix'
    
    def get_note_display(self, obj):
        """Afficher la note avec des étoiles."""
        if obj.nombre_avis == 0:
            return format_html('<span style="color: gray;">Aucun avis</span>')
        
        # Étoiles pleines
        stars_full = int(obj.note_moyenne)
        # Demi-étoile
        stars_half = 1 if obj.note_moyenne - stars_full >= 0.5 else 0
        # Étoiles vides
        stars_empty = 5 - stars_full - stars_half
        
        stars_html = '⭐' * stars_full + '½⭐' * stars_half + '☆' * stars_empty
        
        return format_html(
            '{}<br/><span style="color: gray; font-size: 11px;">{:.1f}/5 ({} avis)</span>',
            stars_html,
            obj.note_moyenne,
            obj.nombre_avis
        )
    get_note_display.short_description = 'Note'
    
    # Actions personnalisées
    
    actions = [
        'rendre_disponible',
        'rendre_indisponible',
        'mettre_en_maintenance'
    ]
    
    def rendre_disponible(self, request, queryset):
        """Rendre les véhicules sélectionnés disponibles."""
        count = queryset.update(statut='DISPONIBLE', est_disponible=True)
        self.message_user(
            request,
            f'{count} véhicule(s) marqué(s) comme disponible(s).'
        )
    rendre_disponible.short_description = "✅ Rendre disponible(s)"
    
    def rendre_indisponible(self, request, queryset):
        """Rendre les véhicules sélectionnés indisponibles."""
        count = queryset.update(statut='INDISPONIBLE', est_disponible=False)
        self.message_user(
            request,
            f'{count} véhicule(s) marqué(s) comme indisponible(s).'
        )
    rendre_indisponible.short_description = "❌ Rendre indisponible(s)"
    
    def mettre_en_maintenance(self, request, queryset):
        """Mettre les véhicules en maintenance."""
        count = queryset.update(statut='MAINTENANCE', est_disponible=False)
        self.message_user(
            request,
            f'{count} véhicule(s) mis en maintenance.'
        )
    mettre_en_maintenance.short_description = "🔧 Mettre en maintenance"

    def disponibilite_vente(self, obj):
        """Affiche le statut de disponibilité à la vente avec couleur"""
        if obj.est_disponible_vente:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Vente</span>'
            )
        return format_html(
            '<span style="color: gray;">✗ Vente</span>'
        )
    disponibilite_vente.short_description = 'Disponible vente'


    def disponibilite_location(self, obj):
        """Affiche le statut de disponibilité à la location avec couleur"""
        if obj.est_disponible_location:
            return format_html(
                '<span style="color: blue; font-weight: bold;">✓ Location</span>'
            )
        return format_html(
            '<span style="color: gray;">✗ Location</span>'
        )
    disponibilite_location.short_description = 'Disponible location'
# ========================================
# ADMIN IMAGES VÉHICULE
# ========================================

@admin.register(ImageVehicule)
class ImageVehiculeAdmin(admin.ModelAdmin):
    """Administration des images de véhicules."""
    
    list_display = [
        'id', 'get_image_preview', 'vehicule', 
        'description', 'ordre', 'date_ajout'
    ]
    
    list_filter = ['vehicule__marque', 'date_ajout']
    
    search_fields = [
        'vehicule__marque', 'vehicule__modele', 'description'
    ]
    
    ordering = ['vehicule', 'ordre', '-date_ajout']
    
    readonly_fields = ['date_ajout', 'get_image_preview_large']
    
    fieldsets = (
        ('Véhicule', {
            'fields': ('vehicule',)
        }),
        ('Image', {
            'fields': ('image', 'get_image_preview_large', 'description', 'ordre')
        }),
        ('Métadonnées', {
            'fields': ('date_ajout',),
            'classes': ('collapse',)
        }),
    )
    
    def get_image_preview(self, obj):
        """Miniature de l'image."""
        if obj.image:
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return '—'
    get_image_preview.short_description = 'Image'
    
    def get_image_preview_large(self, obj):
        """Grande prévisualisation."""
        if obj.image:
            return format_html(
                '<img src="{}" width="300" style="border-radius: 8px;" />',
                obj.image.url
            )
        return '—'
    get_image_preview_large.short_description = 'Prévisualisation'


# ========================================
# ADMIN ÉQUIPEMENTS
# ========================================

@admin.register(Equipement)
class EquipementAdmin(admin.ModelAdmin):
    """Administration des équipements."""
    
    list_display = [
        'id', 'get_icone_display', 'nom', 
        'est_populaire', 'get_count_vehicules'
    ]
    
    list_filter = ['est_populaire']
    
    search_fields = ['nom', 'description']
    
    ordering = ['-est_populaire', 'nom']
    
    fieldsets = (
        ('Informations', {
            'fields': ('nom', 'icone', 'description')
        }),
        ('Options', {
            'fields': ('est_populaire',)
        }),
    )
    
    def get_icone_display(self, obj):
        """Afficher l'icône."""
        if obj.icone:
            return format_html(
                '<span style="font-size: 20px;">{}</span>',
                obj.icone
            )
        return '—'
    get_icone_display.short_description = 'Icône'
    
    def get_count_vehicules(self, obj):
        """Nombre de véhicules avec cet équipement."""
        # TODO: Implémenter le comptage
        return '—'
    get_count_vehicules.short_description = 'Nb véhicules'