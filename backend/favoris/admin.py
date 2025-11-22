# backend/favoris/admin.py
# Interface d'administration pour les favoris et l'historique

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import Favori, Historique


@admin.register(Favori)
class FavoriAdmin(admin.ModelAdmin):
    """
    Interface d'administration pour les favoris.
    """
    
    list_display = [
        'id',
        'client_nom',
        'vehicule_info',
        'prix_initial_display',
        'difference_prix_display',
        'alerte_prix_display',
        'date_ajout',
    ]
    
    list_filter = [
        'alerte_prix_active',
        'date_ajout',
    ]
    
    search_fields = [
        'client__nom',
        'client__prenom',
        'client__email',
        'vehicule__nom_modele',
        'vehicule__marque__nom',
        'notes',
    ]
    
    readonly_fields = [
        'client',
        'vehicule',
        'date_ajout',
        'prix_initial',
        'difference_prix_display',
        'a_baisse_display',
    ]
    
    fieldsets = (
        ('Client', {
            'fields': (
                'client',
            )
        }),
        ('Véhicule', {
            'fields': (
                'vehicule',
            )
        }),
        ('Prix', {
            'fields': (
                'prix_initial',
                'difference_prix_display',
                'a_baisse_display',
            )
        }),
        ('Alerte & Notes', {
            'fields': (
                'alerte_prix_active',
                'notes',
            )
        }),
        ('Dates', {
            'fields': (
                'date_ajout',
            )
        }),
    )
    
    date_hierarchy = 'date_ajout'
    
    def client_nom(self, obj):
        """Afficher le nom du client."""
        return obj.client.nom_complet
    client_nom.short_description = 'Client'
    client_nom.admin_order_field = 'client__nom'
    
    def vehicule_info(self, obj):
        """Afficher les infos du véhicule avec lien."""
        url = reverse('admin:vehicules_vehicule_change', args=[obj.vehicule.id])
        return format_html(
            '<a href="{}" target="_blank">{}</a>',
            url,
            obj.vehicule.nom_complet
        )
    vehicule_info.short_description = 'Véhicule'
    vehicule_info.admin_order_field = 'vehicule__nom_modele'
    
    def prix_initial_display(self, obj):
        """Afficher le prix initial."""
        if obj.prix_initial:
            return f"{int(obj.prix_initial):,} FCFA".replace(',', ' ')
        return '-'
    prix_initial_display.short_description = 'Prix initial'
    prix_initial_display.admin_order_field = 'prix_initial'
    
    def difference_prix_display(self, obj):
        """Afficher la différence de prix."""
        diff = obj.difference_prix
        if diff is not None:
            if diff < 0:
                return format_html(
                    '<span style="color: #28A745; font-weight: bold;">-{} FCFA ↓</span>',
                    int(abs(diff))
                )
            elif diff > 0:
                return format_html(
                    '<span style="color: #DC3545;">+{} FCFA ↑</span>',
                    int(diff)
                )
            else:
                return '0 FCFA'
        return '-'
    difference_prix_display.short_description = 'Différence prix'
    
    def a_baisse_display(self, obj):
        """Afficher si le prix a baissé."""
        if obj.verifier_baisse_prix():
            return format_html(
                '<span style="color: #28A745; font-weight: bold;">✓ Oui</span>'
            )
        return format_html(
            '<span style="color: #999;">✗ Non</span>'
        )
    a_baisse_display.short_description = 'Prix baissé'
    
    def alerte_prix_display(self, obj):
        """Afficher si l'alerte est active."""
        if obj.alerte_prix_active:
            return format_html(
                '<span style="background: #FFC107; color: black; padding: 2px 8px; border-radius: 3px; font-size: 11px;">🔔 ACTIVE</span>'
            )
        return format_html(
            '<span style="color: #999;">Inactive</span>'
        )
    alerte_prix_display.short_description = 'Alerte prix'
    alerte_prix_display.admin_order_field = 'alerte_prix_active'
    
    def get_queryset(self, request):
        """Optimiser les requêtes."""
        queryset = super().get_queryset(request)
        return queryset.select_related(
            'client',
            'vehicule',
            'vehicule__marque'
        )


@admin.register(Historique)
class HistoriqueAdmin(admin.ModelAdmin):
    """
    Interface d'administration pour l'historique.
    """
    
    list_display = [
        'id',
        'utilisateur_nom',
        'type_action_colored',
        'vehicule_info',
        'date_action',
        'ip_address',
    ]
    
    list_filter = [
        'type_action',
        'date_action',
    ]
    
    search_fields = [
        'utilisateur__nom',
        'utilisateur__prenom',
        'utilisateur__email',
        'description',
        'vehicule__nom_modele',
        'ip_address',
    ]
    
    readonly_fields = [
        'utilisateur',
        'type_action',
        'description',
        'vehicule',
        'ip_address',
        'user_agent',
        'donnees_supplementaires',
        'date_action',
    ]
    
    fieldsets = (
        ('Utilisateur', {
            'fields': (
                'utilisateur',
            )
        }),
        ('Action', {
            'fields': (
                'type_action',
                'description',
                'vehicule',
            )
        }),
        ('Métadonnées techniques', {
            'fields': (
                'ip_address',
                'user_agent',
                'donnees_supplementaires',
            ),
            'classes': ('collapse',)
        }),
        ('Date', {
            'fields': (
                'date_action',
            )
        }),
    )
    
    date_hierarchy = 'date_action'
    
    def has_add_permission(self, request):
        """Empêcher l'ajout manuel."""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Empêcher la modification."""
        return False
    
    def utilisateur_nom(self, obj):
        """Afficher le nom de l'utilisateur."""
        return obj.utilisateur.nom_complet
    utilisateur_nom.short_description = 'Utilisateur'
    utilisateur_nom.admin_order_field = 'utilisateur__nom'
    
    def type_action_colored(self, obj):
        """Afficher le type d'action avec couleur."""
        colors = {
            'CONNEXION': '#007BFF',
            'CONSULTATION_VEHICULE': '#17A2B8',
            'AJOUT_FAVORI': '#FFC107',
            'RETRAIT_FAVORI': '#6C757D',
            'DEMANDE_CONTACT': '#28A745',
            'DEMANDE_ESSAI': '#20C997',
            'DEMANDE_LOCATION': '#007BFF',
            'LOCATION_CONFIRMEE': '#28A745',
            'AVIS_PUBLIE': '#FD7E14',
        }
        
        color = colors.get(obj.type_action, '#6C757D')
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">●</span> {}',
            color,
            obj.get_type_action_display()
        )
    type_action_colored.short_description = 'Action'
    type_action_colored.admin_order_field = 'type_action'
    
    def vehicule_info(self, obj):
        """Afficher les infos du véhicule."""
        if obj.vehicule:
            url = reverse('admin:vehicules_vehicule_change', args=[obj.vehicule.id])
            return format_html(
                '<a href="{}" target="_blank">{}</a>',
                url,
                obj.vehicule.nom_complet
            )
        return '-'
    vehicule_info.short_description = 'Véhicule'
    
    def get_queryset(self, request):
        """Optimiser les requêtes."""
        queryset = super().get_queryset(request)
        return queryset.select_related(
            'utilisateur',
            'vehicule',
            'vehicule__marque'
        )