# backend/promotions/admin.py
# Interface d'administration pour les promotions

from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Sum, Count
from .models import Promotion, UtilisationPromotion


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    """
    Interface d'administration pour les promotions.
    """
    
    list_display = [
        'id',
        'code_display',
        'nom',
        'type_reduction_display',
        'valeur_display',
        'statut_colored',
        'periode_display',
        'utilisations_display',
        'concessionnaire_nom',
    ]
    
    list_filter = [
        'statut',
        'type_reduction',
        'est_cumulable',
        'est_visible',
        'date_debut',
        'date_fin',
    ]
    
    search_fields = [
        'nom',
        'code',
        'description',
        'concessionnaire__nom',
        'concessionnaire__prenom',
        'concessionnaire__email',
    ]
    
    readonly_fields = [
        'nombre_utilisations',
        'date_creation',
        'date_modification',
        'reste_utilisations_display',
        'jours_restants_display',
        'est_valide_display',
    ]
    
    filter_horizontal = [
        'vehicules',
        'categories',
        'clients_cibles',
    ]
    
    fieldsets = (
        ('Informations de base', {
            'fields': (
                'nom',
                'description',
                'code',
                'concessionnaire',
            )
        }),
        ('Réduction', {
            'fields': (
                'type_reduction',
                'valeur_reduction',
                'montant_minimum',
                'reduction_maximum',
            )
        }),
        ('Validité', {
            'fields': (
                'date_debut',
                'date_fin',
                'statut',
                'jours_restants_display',
                'est_valide_display',
            )
        }),
        ('Limites', {
            'fields': (
                'nombre_utilisations_max',
                'utilisations_par_client',
                'nombre_utilisations',
                'reste_utilisations_display',
            )
        }),
        ('Ciblage', {
            'fields': (
                'concession',
                'vehicules',
                'categories',
                'clients_cibles',
            ),
            'classes': ('collapse',)
        }),
        ('Options', {
            'fields': (
                'est_cumulable',
                'est_visible',
            )
        }),
        ('Métadonnées', {
            'fields': (
                'date_creation',
                'date_modification',
            ),
            'classes': ('collapse',)
        }),
    )
    
    date_hierarchy = 'date_creation'
    
    actions = [
        'activer_promotions',
        'desactiver_promotions',
        'exporter_csv',
    ]
    
    def code_display(self, obj):
        """Afficher le code avec style."""
        return format_html(
            '<code style="background: #f5f5f5; padding: 3px 8px; border-radius: 3px; font-weight: bold;">{}</code>',
            obj.code
        )
    code_display.short_description = 'Code'
    code_display.admin_order_field = 'code'
    
    def type_reduction_display(self, obj):
        """Afficher le type de réduction."""
        if obj.type_reduction == 'POURCENTAGE':
            return format_html(
                '<span style="color: #6F42C1;">%</span>'
            )
        return format_html(
            '<span style="color: #28A745;">FCFA</span>'
        )
    type_reduction_display.short_description = 'Type'
    type_reduction_display.admin_order_field = 'type_reduction'
    
    def valeur_display(self, obj):
        """Afficher la valeur de réduction."""
        if obj.type_reduction == 'POURCENTAGE':
            return format_html(
                '<span style="font-weight: bold; color: #6F42C1;">-{}%</span>',
                int(obj.valeur_reduction)
            )
        return format_html(
            '<span style="font-weight: bold; color: #28A745;">-{} FCFA</span>',
            int(obj.valeur_reduction)
        )
    valeur_display.short_description = 'Réduction'
    valeur_display.admin_order_field = 'valeur_reduction'
    
    def statut_colored(self, obj):
        """Afficher le statut avec couleur."""
        colors = {
            'ACTIF': '#28A745',
            'INACTIF': '#6C757D',
            'EXPIRE': '#DC3545',
        }
        
        color = colors.get(obj.statut, '#6C757D')
        
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 10px; border-radius: 3px; font-size: 11px; font-weight: bold;">{}</span>',
            color,
            obj.get_statut_display()
        )
    statut_colored.short_description = 'Statut'
    statut_colored.admin_order_field = 'statut'
    
    def periode_display(self, obj):
        """Afficher la période de validité."""
        return f"{obj.date_debut.strftime('%d/%m/%Y')} → {obj.date_fin.strftime('%d/%m/%Y')}"
    periode_display.short_description = 'Période'
    
    def utilisations_display(self, obj):
        """Afficher le compteur d'utilisations."""
        if obj.nombre_utilisations_max:
            pourcentage = (obj.nombre_utilisations / obj.nombre_utilisations_max) * 100
            
            if pourcentage >= 90:
                color = '#DC3545'
            elif pourcentage >= 70:
                color = '#FFC107'
            else:
                color = '#28A745'
            
            return format_html(
                '<span style="color: {};">{}/{}</span>',
                color,
                obj.nombre_utilisations,
                obj.nombre_utilisations_max
            )
        return f"{obj.nombre_utilisations}/∞"
    utilisations_display.short_description = 'Utilisations'
    
    def concessionnaire_nom(self, obj):
        """Afficher le nom du concessionnaire."""
        return obj.concessionnaire.nom_complet
    concessionnaire_nom.short_description = 'Concessionnaire'
    concessionnaire_nom.admin_order_field = 'concessionnaire__nom'
    
    def reste_utilisations_display(self, obj):
        """Afficher le nombre d'utilisations restantes."""
        reste = obj.reste_utilisations
        if reste is None:
            return "Illimité"
        return reste
    reste_utilisations_display.short_description = 'Utilisations restantes'
    
    def jours_restants_display(self, obj):
        """Afficher le nombre de jours restants."""
        jours = obj.jours_restants
        if jours == 0:
            return format_html(
                '<span style="color: #DC3545; font-weight: bold;">Expiré</span>'
            )
        elif jours <= 7:
            return format_html(
                '<span style="color: #FFC107; font-weight: bold;">{} jour(s)</span>',
                jours
            )
        return f"{jours} jours"
    jours_restants_display.short_description = 'Jours restants'
    
    def est_valide_display(self, obj):
        """Afficher si la promotion est valide."""
        if obj.est_valide:
            return format_html(
                '<span style="color: #28A745; font-weight: bold;">✓ Valide</span>'
            )
        return format_html(
            '<span style="color: #DC3545;">✗ Non valide</span>'
        )
    est_valide_display.short_description = 'Valide'
    
    def activer_promotions(self, request, queryset):
        """Activer les promotions sélectionnées."""
        count = queryset.exclude(statut='EXPIRE').update(statut='ACTIF')
        self.message_user(request, f'{count} promotion(s) activée(s).')
    activer_promotions.short_description = '✓ Activer les promotions'
    
    def desactiver_promotions(self, request, queryset):
        """Désactiver les promotions sélectionnées."""
        count = queryset.update(statut='INACTIF')
        self.message_user(request, f'{count} promotion(s) désactivée(s).')
    desactiver_promotions.short_description = '✗ Désactiver les promotions'
    
    def exporter_csv(self, request, queryset):
        """Exporter les promotions en CSV."""
        import csv
        from django.http import HttpResponse
        from django.utils import timezone
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="promotions_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'ID',
            'Code',
            'Nom',
            'Type',
            'Valeur',
            'Date début',
            'Date fin',
            'Statut',
            'Utilisations',
            'Concessionnaire',
        ])
        
        for promo in queryset:
            writer.writerow([
                promo.id,
                promo.code,
                promo.nom,
                promo.get_type_reduction_display(),
                f"{promo.valeur_reduction}{'%' if promo.type_reduction == 'POURCENTAGE' else ' FCFA'}",
                promo.date_debut.strftime('%Y-%m-%d'),
                promo.date_fin.strftime('%Y-%m-%d'),
                promo.get_statut_display(),
                f"{promo.nombre_utilisations}/{promo.nombre_utilisations_max or '∞'}",
                promo.concessionnaire.nom_complet,
            ])
        
        return response
    exporter_csv.short_description = '📥 Exporter en CSV'
    
    def get_queryset(self, request):
        """Optimiser les requêtes."""
        queryset = super().get_queryset(request)
        return queryset.select_related(
            'concessionnaire',
            'concession'
        )


@admin.register(UtilisationPromotion)
class UtilisationPromotionAdmin(admin.ModelAdmin):
    """
    Interface d'administration pour l'historique d'utilisation.
    """
    
    list_display = [
        'id',
        'promotion_code',
        'client_nom',
        'montant_reduction_display',
        'location_info',
        'date_utilisation',
    ]
    
    list_filter = [
        'date_utilisation',
        'promotion',
    ]
    
    search_fields = [
        'promotion__code',
        'promotion__nom',
        'client__nom',
        'client__prenom',
        'client__email',
    ]
    
    readonly_fields = [
        'promotion',
        'client',
        'location',
        'montant_reduction',
        'date_utilisation',
    ]
    
    date_hierarchy = 'date_utilisation'
    
    def has_add_permission(self, request):
        """Empêcher l'ajout manuel."""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Empêcher la modification."""
        return False
    
    def promotion_code(self, obj):
        """Afficher le code de la promotion."""
        return format_html(
            '<code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px;">{}</code>',
            obj.promotion.code
        )
    promotion_code.short_description = 'Code promo'
    promotion_code.admin_order_field = 'promotion__code'
    
    def client_nom(self, obj):
        """Afficher le nom du client."""
        return obj.client.nom_complet
    client_nom.short_description = 'Client'
    client_nom.admin_order_field = 'client__nom'
    
    def montant_reduction_display(self, obj):
        """Afficher le montant de la réduction."""
        if obj.montant_reduction:
            return format_html(
                '<span style="color: #28A745; font-weight: bold;">-{} FCFA</span>',
                int(obj.montant_reduction)
            )
        return '-'
    montant_reduction_display.short_description = 'Réduction'
    
    def location_info(self, obj):
        """Afficher les infos de la location."""
        if obj.location:
            return f"Location #{obj.location.id}"
        return '-'
    location_info.short_description = 'Location'
    
    def get_queryset(self, request):
        """Optimiser les requêtes."""
        queryset = super().get_queryset(request)
        return queryset.select_related(
            'promotion',
            'client',
            'location'
        )