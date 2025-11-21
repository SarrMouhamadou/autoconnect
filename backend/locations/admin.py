# backend/locations/admin.py
# Interface d'administration pour les locations

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Location, ContratLocation


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    """
    Interface d'administration pour les locations.
    """
    
    list_display = [
        'id',
        'client_nom',
        'vehicule_info',
        'periode',
        'prix_total_display',
        'statut_colored',
        'retard_display',
        'date_creation',
    ]
    
    list_filter = [
        'statut',
        'date_debut',
        'date_fin',
        'date_creation',
        'jours_retard',
    ]
    
    search_fields = [
        'client__nom',
        'client__prenom',
        'client__email',
        'vehicule__nom_modele',
        'vehicule__marque__nom',
        'vehicule__immatriculation',
    ]
    
    readonly_fields = [
        'client',
        'vehicule',
        'concessionnaire',
        'concession',
        'nombre_jours',
        'prix_total',
        'jours_retard',
        'montant_penalite',
        'date_creation',
        'date_modification',
        'duree_reelle_display',
        'kilometres_parcourus_display',
        'montant_total_final_display',
    ]
    
    fieldsets = (
        ('Demandeur', {
            'fields': (
                'client',
            )
        }),
        ('Véhicule & Concession', {
            'fields': (
                'vehicule',
                'concessionnaire',
                'concession',
            )
        }),
        ('Période de location', {
            'fields': (
                ('date_debut', 'date_fin'),
                'nombre_jours',
                ('date_depart_reel', 'date_retour_reel'),
                'duree_reelle_display',
            )
        }),
        ('Tarification', {
            'fields': (
                'prix_jour',
                'prix_total',
                'caution',
            )
        }),
        ('Kilométrage', {
            'fields': (
                ('kilometrage_depart', 'kilometrage_retour'),
                'kilometres_parcourus_display',
            )
        }),
        ('Statut & Pénalités', {
            'fields': (
                'statut',
                ('jours_retard', 'taux_penalite_jour'),
                'montant_penalite',
                'montant_total_final_display',
            )
        }),
        ('Informations complémentaires', {
            'fields': (
                'notes_client',
                'notes_concessionnaire',
                'etat_depart',
                'etat_retour',
            ),
            'classes': ('collapse',)
        }),
        ('Dates', {
            'fields': (
                'date_creation',
                'date_modification',
            ),
            'classes': ('collapse',)
        }),
    )
    
    actions = [
        'marquer_confirmee',
        'marquer_annulee',
        'exporter_csv',
    ]
    
    date_hierarchy = 'date_debut'
    
    def client_nom(self, obj):
        """Afficher le nom complet du client."""
        return obj.client.nom_complet
    client_nom.short_description = 'Client'
    client_nom.admin_order_field = 'client__nom'
    
    def vehicule_info(self, obj):
        """Afficher les infos du véhicule."""
        return f"{obj.vehicule.nom_complet} ({obj.vehicule.immatriculation})"
    vehicule_info.short_description = 'Véhicule'
    vehicule_info.admin_order_field = 'vehicule__nom_modele'
    
    def periode(self, obj):
        """Afficher la période de location."""
        return f"{obj.date_debut.strftime('%d/%m/%Y')} → {obj.date_fin.strftime('%d/%m/%Y')}"
    periode.short_description = 'Période'
    
    def prix_total_display(self, obj):
        """Afficher le prix total formaté."""
        return f"{int(obj.prix_total):,} FCFA".replace(',', ' ')
    prix_total_display.short_description = 'Prix total'
    prix_total_display.admin_order_field = 'prix_total'
    
    def statut_colored(self, obj):
        """Afficher le statut avec couleur."""
        colors = {
            'DEMANDE': '#FFA500',      # Orange
            'CONFIRMEE': '#007BFF',    # Bleu
            'EN_COURS': '#17A2B8',     # Cyan
            'TERMINEE': '#28A745',     # Vert
            'ANNULEE': '#DC3545',      # Rouge
        }
        
        color = colors.get(obj.statut, '#6C757D')
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">●</span> {}',
            color,
            obj.get_statut_display()
        )
    statut_colored.short_description = 'Statut'
    statut_colored.admin_order_field = 'statut'
    
    def retard_display(self, obj):
        """Afficher le retard s'il y en a."""
        if obj.jours_retard > 0:
            return format_html(
                '<span style="color: #DC3545; font-weight: bold;">{} jour(s)</span>',
                obj.jours_retard
            )
        return '-'
    retard_display.short_description = 'Retard'
    retard_display.admin_order_field = 'jours_retard'
    
    def duree_reelle_display(self, obj):
        """Afficher la durée réelle."""
        duree = obj.duree_reelle
        if duree is not None:
            return f"{duree} jour(s)"
        return "Non terminée"
    duree_reelle_display.short_description = 'Durée réelle'
    
    def kilometres_parcourus_display(self, obj):
        """Afficher les kilomètres parcourus."""
        km = obj.kilometres_parcourus
        if km is not None:
            return f"{km:,} km".replace(',', ' ')
        return "Non disponible"
    kilometres_parcourus_display.short_description = 'Km parcourus'
    
    def montant_total_final_display(self, obj):
        """Afficher le montant total final (avec pénalités)."""
        return f"{int(obj.montant_total_final):,} FCFA".replace(',', ' ')
    montant_total_final_display.short_description = 'Montant total final'
    
    def marquer_confirmee(self, request, queryset):
        """Marquer les locations comme confirmées."""
        count = 0
        for location in queryset:
            if location.confirmer():
                count += 1
        
        self.message_user(request, f'{count} location(s) confirmée(s).')
    marquer_confirmee.short_description = 'Marquer confirmée'
    
    def marquer_annulee(self, request, queryset):
        """Marquer les locations comme annulées."""
        count = queryset.filter(statut='DEMANDE').update(statut='ANNULEE')
        self.message_user(request, f'{count} location(s) annulée(s).')
    marquer_annulee.short_description = 'Marquer annulée'
    
    def exporter_csv(self, request, queryset):
        """Exporter les locations en CSV."""
        import csv
        from django.http import HttpResponse
        from django.utils import timezone
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="locations_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'ID',
            'Date création',
            'Client',
            'Email',
            'Téléphone',
            'Véhicule',
            'Date début',
            'Date fin',
            'Nb jours',
            'Prix total',
            'Statut',
            'Retard (jours)',
            'Pénalités',
        ])
        
        for location in queryset:
            writer.writerow([
                location.id,
                location.date_creation.strftime('%Y-%m-%d %H:%M'),
                location.client.nom_complet,
                location.client.email,
                location.client.telephone or '',
                location.vehicule.nom_complet,
                location.date_debut.strftime('%Y-%m-%d'),
                location.date_fin.strftime('%Y-%m-%d'),
                location.nombre_jours,
                int(location.prix_total),
                location.get_statut_display(),
                location.jours_retard,
                int(location.montant_penalite),
            ])
        
        return response
    exporter_csv.short_description = 'Exporter en CSV'
    
    def get_queryset(self, request):
        """Optimiser les requêtes."""
        queryset = super().get_queryset(request)
        return queryset.select_related(
            'client',
            'vehicule',
            'vehicule__marque',
            'concessionnaire',
            'concession'
        )


@admin.register(ContratLocation)
class ContratLocationAdmin(admin.ModelAdmin):
    """
    Interface d'administration pour les contrats de location.
    """
    
    list_display = [
        'numero_contrat',
        'location_info',
        'client_nom',
        'fichier_link',
        'date_generation',
    ]
    
    list_filter = [
        'date_generation',
    ]
    
    search_fields = [
        'numero_contrat',
        'location__client__nom',
        'location__client__prenom',
        'location__vehicule__nom_modele',
    ]
    
    readonly_fields = [
        'location',
        'numero_contrat',
        'date_generation',
        'hash_contrat',
        'fichier_link',
    ]
    
    fieldsets = (
        ('Contrat', {
            'fields': (
                'numero_contrat',
                'location',
                'fichier_pdf',
                'fichier_link',
            )
        }),
        ('Métadonnées', {
            'fields': (
                'date_generation',
                'hash_contrat',
            )
        }),
    )
    
    def location_info(self, obj):
        """Afficher les infos de la location."""
        url = reverse('admin:locations_location_change', args=[obj.location.id])
        return format_html(
            '<a href="{}" target="_blank">Location #{} - {}</a>',
            url,
            obj.location.id,
            obj.location.vehicule.nom_complet
        )
    location_info.short_description = 'Location'
    
    def client_nom(self, obj):
        """Afficher le nom du client."""
        return obj.location.client.nom_complet
    client_nom.short_description = 'Client'
    
    def fichier_link(self, obj):
        """Afficher un lien vers le fichier PDF."""
        if obj.fichier_pdf:
            return format_html(
                '<a href="{}" target="_blank">📄 Télécharger le contrat</a>',
                obj.fichier_pdf.url
            )
        return '-'
    fichier_link.short_description = 'Fichier'
    
    def get_queryset(self, request):
        """Optimiser les requêtes."""
        queryset = super().get_queryset(request)
        return queryset.select_related(
            'location',
            'location__client',
            'location__vehicule',
            'location__vehicule__marque'
        )