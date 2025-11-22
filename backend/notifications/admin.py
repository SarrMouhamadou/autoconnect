# backend/notifications/admin.py
# Interface d'administration pour les notifications

from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count, Q
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """
    Interface d'administration pour les notifications.
    """
    
    list_display = [
        'id',
        'statut_display',
        'destinataire_nom',
        'type_colored',
        'titre_court',
        'priorite_display',
        'date_creation',
    ]
    
    list_filter = [
        'est_lue',
        'type_notification',
        'niveau_priorite',
        'date_creation',
    ]
    
    search_fields = [
        'destinataire__nom',
        'destinataire__prenom',
        'destinataire__email',
        'titre',
        'message',
    ]
    
    readonly_fields = [
        'destinataire',
        'date_creation',
        'date_lecture',
        'age_display',
        'est_expiree_display',
    ]
    
    fieldsets = (
        ('Destinataire', {
            'fields': (
                'destinataire',
            )
        }),
        ('Contenu', {
            'fields': (
                'type_notification',
                'titre',
                'message',
                'niveau_priorite',
            )
        }),
        ('Action', {
            'fields': (
                'lien',
                'texte_action',
            ),
            'classes': ('collapse',)
        }),
        ('Statut', {
            'fields': (
                'est_lue',
                'date_lecture',
            )
        }),
        ('Métadonnées', {
            'fields': (
                'donnees_supplementaires',
                'date_expiration',
                'est_expiree_display',
            ),
            'classes': ('collapse',)
        }),
        ('Dates', {
            'fields': (
                'date_creation',
                'age_display',
            )
        }),
    )
    
    date_hierarchy = 'date_creation'
    
    actions = [
        'marquer_comme_lue',
        'marquer_comme_non_lue',
        'supprimer_lues',
        'exporter_csv',
    ]
    
    def statut_display(self, obj):
        """Afficher le statut (lue/non lue)."""
        if obj.est_lue:
            return format_html(
                '<span style="color: #28A745; font-size: 18px;" title="Lue">✓</span>'
            )
        return format_html(
            '<span style="color: #DC3545; font-size: 18px;" title="Non lue">●</span>'
        )
    statut_display.short_description = '●'
    statut_display.admin_order_field = 'est_lue'
    
    def destinataire_nom(self, obj):
        """Afficher le nom du destinataire."""
        return obj.destinataire.nom_complet
    destinataire_nom.short_description = 'Destinataire'
    destinataire_nom.admin_order_field = 'destinataire__nom'
    
    def type_colored(self, obj):
        """Afficher le type avec couleur."""
        colors = {
            'DEMANDE_RECUE': '#007BFF',
            'DEMANDE_TRAITEE': '#6C757D',
            'LOCATION_DEMANDEE': '#17A2B8',
            'LOCATION_CONFIRMEE': '#28A745',
            'LOCATION_REFUSEE': '#DC3545',
            'LOCATION_DEPART': '#FFC107',
            'LOCATION_RETOUR': '#20C997',
            'LOCATION_RETARD': '#FF5722',
            'AVIS_RECU': '#FD7E14',
            'AVIS_REPONSE': '#6F42C1',
            'COMPTE_VALIDE': '#28A745',
            'COMPTE_REJETE': '#DC3545',
            'COMPTE_SUSPENDU': '#FFC107',
            'FAVORI_PRIX_BAISSE': '#FF4081',
            'FAVORI_DISPONIBLE': '#4CAF50',
            'INFORMATION': '#2196F3',
            'ALERTE': '#FF9800',
            'ERREUR': '#F44336',
        }
        
        color = colors.get(obj.type_notification, '#6C757D')
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">●</span> {}',
            color,
            obj.get_type_notification_display()
        )
    type_colored.short_description = 'Type'
    type_colored.admin_order_field = 'type_notification'
    
    def titre_court(self, obj):
        """Afficher un titre court."""
        if len(obj.titre) > 50:
            return obj.titre[:50] + '...'
        return obj.titre
    titre_court.short_description = 'Titre'
    
    def priorite_display(self, obj):
        """Afficher la priorité avec badge."""
        colors = {
            'BASSE': '#6C757D',
            'NORMALE': '#17A2B8',
            'HAUTE': '#FFC107',
            'URGENTE': '#DC3545',
        }
        
        color = colors.get(obj.niveau_priorite, '#6C757D')
        
        return format_html(
            '<span style="background: {}; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: bold;">{}</span>',
            color,
            obj.get_niveau_priorite_display()
        )
    priorite_display.short_description = 'Priorité'
    priorite_display.admin_order_field = 'niveau_priorite'
    
    def age_display(self, obj):
        """Afficher l'âge de la notification."""
        age = obj.age_en_jours
        
        if age == 0:
            return "Aujourd'hui"
        elif age == 1:
            return "Hier"
        elif age < 7:
            return f"Il y a {age} jours"
        elif age < 30:
            semaines = age // 7
            return f"Il y a {semaines} semaine(s)"
        else:
            mois = age // 30
            return f"Il y a {mois} mois"
    age_display.short_description = 'Âge'
    
    def est_expiree_display(self, obj):
        """Afficher si expirée."""
        if obj.est_expiree:
            return format_html(
                '<span style="color: #DC3545; font-weight: bold;">✓ Oui</span>'
            )
        return format_html(
            '<span style="color: #28A745;">✗ Non</span>'
        )
    est_expiree_display.short_description = 'Expirée'
    
    def marquer_comme_lue(self, request, queryset):
        """Marquer les notifications comme lues."""
        count = 0
        for notification in queryset:
            notification.marquer_comme_lue()
            count += 1
        
        self.message_user(request, f'{count} notification(s) marquée(s) comme lue(s).')
    marquer_comme_lue.short_description = '✓ Marquer comme lue'
    
    def marquer_comme_non_lue(self, request, queryset):
        """Marquer les notifications comme non lues."""
        count = 0
        for notification in queryset:
            notification.marquer_comme_non_lue()
            count += 1
        
        self.message_user(request, f'{count} notification(s) marquée(s) comme non lue(s).')
    marquer_comme_non_lue.short_description = '● Marquer comme non lue'
    
    def supprimer_lues(self, request, queryset):
        """Supprimer les notifications lues."""
        count, _ = queryset.filter(est_lue=True).delete()
        self.message_user(request, f'{count} notification(s) lue(s) supprimée(s).')
    supprimer_lues.short_description = '🗑️ Supprimer les lues'
    
    def exporter_csv(self, request, queryset):
        """Exporter les notifications en CSV."""
        import csv
        from django.http import HttpResponse
        from django.utils import timezone
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="notifications_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'ID',
            'Date',
            'Destinataire',
            'Type',
            'Titre',
            'Message',
            'Priorité',
            'Lue',
        ])
        
        for notif in queryset:
            writer.writerow([
                notif.id,
                notif.date_creation.strftime('%Y-%m-%d %H:%M'),
                notif.destinataire.nom_complet,
                notif.get_type_notification_display(),
                notif.titre,
                notif.message[:100] + '...' if len(notif.message) > 100 else notif.message,
                notif.get_niveau_priorite_display(),
                'Oui' if notif.est_lue else 'Non',
            ])
        
        return response
    exporter_csv.short_description = '📥 Exporter en CSV'
    
    def get_queryset(self, request):
        """Optimiser les requêtes."""
        queryset = super().get_queryset(request)
        return queryset.select_related('destinataire')
    
    def changelist_view(self, request, extra_context=None):
        """Ajouter des statistiques dans la vue liste."""
        extra_context = extra_context or {}
        
        # Statistiques
        total = self.get_queryset(request).count()
        non_lues = self.get_queryset(request).filter(est_lue=False).count()
        
        extra_context['total_notifications'] = total
        extra_context['non_lues'] = non_lues
        extra_context['lues'] = total - non_lues
        
        return super().changelist_view(request, extra_context=extra_context)