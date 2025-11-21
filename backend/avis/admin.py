# backend/avis/admin.py
# Interface d'administration pour les avis

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import Avis


@admin.register(Avis)
class AvisAdmin(admin.ModelAdmin):
    """
    Interface d'administration pour les avis.
    """
    
    list_display = [
        'id',
        'client_nom',
        'vehicule_info',
        'note_colored',
        'recommande_display',
        'a_reponse_display',
        'statut_display',
        'date_creation',
    ]
    
    list_filter = [
        'note',
        'recommande',
        'est_valide',
        'est_signale',
        'date_creation',
    ]
    
    search_fields = [
        'client__nom',
        'client__prenom',
        'client__email',
        'vehicule__nom_modele',
        'vehicule__marque__nom',
        'titre',
        'commentaire',
    ]
    
    readonly_fields = [
        'client',
        'vehicule',
        'location',
        'date_creation',
        'date_modification',
        'date_reponse',
        'repondu_par',
        'date_moderation',
        'score_utilite_display',
        'note_moyenne_detaillee_display',
    ]
    
    fieldsets = (
        ('Auteur', {
            'fields': (
                'client',
                'location',
            )
        }),
        ('Véhicule', {
            'fields': (
                'vehicule',
            )
        }),
        ('Notation', {
            'fields': (
                'note',
                ('note_confort', 'note_performance'),
                ('note_consommation', 'note_proprete'),
                'note_moyenne_detaillee_display',
                'recommande',
            )
        }),
        ('Contenu', {
            'fields': (
                'titre',
                'commentaire',
                'points_positifs',
                'points_negatifs',
            )
        }),
        ('Réponse du concessionnaire', {
            'fields': (
                'reponse',
                'date_reponse',
                'repondu_par',
            ),
            'classes': ('collapse',)
        }),
        ('Modération', {
            'fields': (
                'est_valide',
                'est_signale',
                'raison_signalement',
                'modere_par',
                'date_moderation',
            )
        }),
        ('Utilité', {
            'fields': (
                'nb_personnes_utile',
                'nb_personnes_inutile',
                'score_utilite_display',
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
        'valider_avis',
        'invalider_avis',
        'marquer_non_signale',
        'exporter_csv',
    ]
    
    date_hierarchy = 'date_creation'
    
    def client_nom(self, obj):
        """Afficher le nom du client."""
        return obj.client.nom_complet
    client_nom.short_description = 'Client'
    client_nom.admin_order_field = 'client__nom'
    
    def vehicule_info(self, obj):
        """Afficher les infos du véhicule."""
        url = reverse('admin:vehicules_vehicule_change', args=[obj.vehicule.id])
        return format_html(
            '<a href="{}" target="_blank">{}</a>',
            url,
            obj.vehicule.nom_complet
        )
    vehicule_info.short_description = 'Véhicule'
    vehicule_info.admin_order_field = 'vehicule__nom_modele'
    
    def note_colored(self, obj):
        """Afficher la note avec des étoiles colorées."""
        stars = '★' * obj.note + '☆' * (5 - obj.note)
        
        colors = {
            5: '#28A745',  # Vert
            4: '#8BC34A',  # Vert clair
            3: '#FFC107',  # Orange
            2: '#FF9800',  # Orange foncé
            1: '#F44336',  # Rouge
        }
        
        color = colors.get(obj.note, '#6C757D')
        
        return format_html(
            '<span style="color: {}; font-size: 16px;">{}</span> <span style="color: #666;">({}/5)</span>',
            color,
            stars,
            obj.note
        )
    note_colored.short_description = 'Note'
    note_colored.admin_order_field = 'note'
    
    def recommande_display(self, obj):
        """Afficher si recommandé."""
        if obj.recommande:
            return format_html(
                '<span style="color: #28A745; font-weight: bold;">✓ Oui</span>'
            )
        return format_html(
            '<span style="color: #DC3545;">✗ Non</span>'
        )
    recommande_display.short_description = 'Recommande'
    recommande_display.admin_order_field = 'recommande'
    
    def a_reponse_display(self, obj):
        """Afficher si réponse."""
        if obj.a_reponse:
            return format_html(
                '<span style="color: #007BFF;">✓ Oui</span>'
            )
        return format_html(
            '<span style="color: #999;">✗ Non</span>'
        )
    a_reponse_display.short_description = 'Réponse'
    
    def statut_display(self, obj):
        """Afficher le statut (validé/signalé)."""
        badges = []
        
        if not obj.est_valide:
            badges.append('<span style="background: #DC3545; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px;">INVALIDE</span>')
        
        if obj.est_signale:
            badges.append('<span style="background: #FFC107; color: black; padding: 2px 8px; border-radius: 3px; font-size: 11px;">SIGNALÉ</span>')
        
        if not badges:
            badges.append('<span style="background: #28A745; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px;">VALIDE</span>')
        
        return format_html(' '.join(badges))
    statut_display.short_description = 'Statut'
    
    def score_utilite_display(self, obj):
        """Afficher le score d'utilité."""
        score = obj.score_utilite
        total = obj.nb_personnes_utile + obj.nb_personnes_inutile
        
        if total == 0:
            return "Aucun vote"
        
        return f"{score:.1f}% ({obj.nb_personnes_utile}/{total})"
    score_utilite_display.short_description = 'Score d\'utilité'
    
    def note_moyenne_detaillee_display(self, obj):
        """Afficher la note moyenne détaillée."""
        note = obj.note_moyenne_detaillee
        if note is not None:
            return f"{note:.2f}/5"
        return "Non renseignée"
    note_moyenne_detaillee_display.short_description = 'Note moyenne détaillée'
    
    def valider_avis(self, request, queryset):
        """Valider les avis sélectionnés."""
        count = 0
        for avis in queryset:
            avis.moderer(valide=True, user=request.user)
            count += 1
        
        self.message_user(request, f'{count} avis validé(s).')
    valider_avis.short_description = 'Valider les avis'
    
    def invalider_avis(self, request, queryset):
        """Invalider les avis sélectionnés."""
        count = 0
        for avis in queryset:
            avis.moderer(valide=False, user=request.user)
            count += 1
        
        self.message_user(request, f'{count} avis invalidé(s).')
    invalider_avis.short_description = 'Invalider les avis'
    
    def marquer_non_signale(self, request, queryset):
        """Marquer comme non signalé."""
        count = queryset.update(est_signale=False, raison_signalement='')
        self.message_user(request, f'{count} avis marqué(s) comme non signalé(s).')
    marquer_non_signale.short_description = 'Marquer non signalé'
    
    def exporter_csv(self, request, queryset):
        """Exporter les avis en CSV."""
        import csv
        from django.http import HttpResponse
        from django.utils import timezone
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="avis_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'ID',
            'Date',
            'Client',
            'Véhicule',
            'Note',
            'Titre',
            'Commentaire',
            'Recommande',
            'Réponse',
            'Validé',
            'Signalé',
        ])
        
        for avis in queryset:
            writer.writerow([
                avis.id,
                avis.date_creation.strftime('%Y-%m-%d %H:%M'),
                avis.client.nom_complet,
                avis.vehicule.nom_complet,
                avis.note,
                avis.titre,
                avis.commentaire[:100] + '...' if len(avis.commentaire) > 100 else avis.commentaire,
                'Oui' if avis.recommande else 'Non',
                'Oui' if avis.a_reponse else 'Non',
                'Oui' if avis.est_valide else 'Non',
                'Oui' if avis.est_signale else 'Non',
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
            'location',
            'repondu_par',
            'modere_par'
        )