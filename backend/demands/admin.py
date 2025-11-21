# backend/demands/admin.py
# Interface d'administration pour les demandes de contact

from django.contrib import admin
from django.utils.html import format_html
from .models import DemandeContact


@admin.register(DemandeContact)
class DemandeContactAdmin(admin.ModelAdmin):
    """
    Interface d'administration pour les demandes de contact.
    """
    
    list_display = [
        'id',
        'client_nom',
        'vehicule_info',
        'type_demande',
        'statut_colored',
        'date_creation',
        'date_reponse',
    ]
    
    list_filter = [
        'type_demande',
        'statut',
        'date_creation',
        'date_reponse',
    ]
    
    search_fields = [
        'client__nom',
        'client__prenom',
        'client__email',
        'vehicule__nom_modele',
        'vehicule__marque__nom',
        'objet',
        'message',
        'telephone_contact',
        'email_contact',
    ]
    
    readonly_fields = [
        'client',
        'vehicule',
        'concessionnaire',
        'date_creation',
        'date_modification',
        'delai_reponse_display',
    ]
    
    fieldsets = (
        ('Demandeur', {
            'fields': (
                'client',
                'telephone_contact',
                'email_contact',
            )
        }),
        ('Véhicule', {
            'fields': (
                'vehicule',
                'concessionnaire',
            )
        }),
        ('Demande', {
            'fields': (
                'type_demande',
                'objet',
                'message',
                'date_souhaitee_essai',
                'heure_souhaitee_essai',
            )
        }),
        ('Traitement', {
            'fields': (
                'statut',
                'reponse',
                'date_reponse',
                'repondu_par',
                'delai_reponse_display',
            )
        }),
        ('Notes internes', {
            'fields': (
                'notes_internes',
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
        'marquer_en_cours',
        'marquer_traitee',
        'exporter_csv',
    ]
    
    date_hierarchy = 'date_creation'
    
    def client_nom(self, obj):
        """Afficher le nom complet du client."""
        return obj.client.nom_complet
    client_nom.short_description = 'Client'
    client_nom.admin_order_field = 'client__nom'
    
    def vehicule_info(self, obj):
        """Afficher les infos du véhicule."""
        return f"{obj.vehicule.nom_complet}"
    vehicule_info.short_description = 'Véhicule'
    vehicule_info.admin_order_field = 'vehicule__nom_modele'
    
    def statut_colored(self, obj):
        """Afficher le statut avec couleur."""
        colors = {
            'EN_ATTENTE': '#FFA500',  # Orange
            'EN_COURS': '#007BFF',    # Bleu
            'TRAITEE': '#28A745',     # Vert
            'ANNULEE': '#DC3545',     # Rouge
        }
        
        color = colors.get(obj.statut, '#6C757D')
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">●</span> {}',
            color,
            obj.get_statut_display()
        )
    statut_colored.short_description = 'Statut'
    statut_colored.admin_order_field = 'statut'
    
    def delai_reponse_display(self, obj):
        """Afficher le délai de réponse."""
        delai = obj.delai_reponse
        if delai is not None:
            if delai < 24:
                return f"{delai} heures"
            else:
                jours = round(delai / 24, 1)
                return f"{jours} jours"
        return "Non répondu"
    delai_reponse_display.short_description = 'Délai de réponse'
    
    def marquer_en_cours(self, request, queryset):
        """Marquer les demandes comme en cours."""
        count = 0
        for demande in queryset:
            if demande.statut == 'EN_ATTENTE':
                demande.marquer_en_cours()
                count += 1
        
        self.message_user(request, f'{count} demande(s) marquée(s) en cours.')
    marquer_en_cours.short_description = 'Marquer en cours'
    
    def marquer_traitee(self, request, queryset):
        """Marquer les demandes comme traitées."""
        count = 0
        for demande in queryset:
            if demande.statut in ['EN_ATTENTE', 'EN_COURS']:
                demande.marquer_traitee(
                    reponse="Traitée par l'administrateur",
                    repondu_par=request.user
                )
                count += 1
        
        self.message_user(request, f'{count} demande(s) marquée(s) comme traitées.')
    marquer_traitee.short_description = 'Marquer traitée'
    
    def exporter_csv(self, request, queryset):
        """Exporter les demandes en CSV."""
        import csv
        from django.http import HttpResponse
        from django.utils import timezone
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="demandes_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'ID',
            'Date',
            'Client',
            'Email',
            'Téléphone',
            'Véhicule',
            'Type',
            'Statut',
            'Objet',
            'Message',
        ])
        
        for demande in queryset:
            writer.writerow([
                demande.id,
                demande.date_creation.strftime('%Y-%m-%d %H:%M'),
                demande.client.nom_complet,
                demande.email_contact,
                demande.telephone_contact,
                demande.vehicule.nom_complet,
                demande.get_type_demande_display(),
                demande.get_statut_display(),
                demande.objet,
                demande.message,
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
            'repondu_par'
        )