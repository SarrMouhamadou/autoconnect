# backend/favoris/management/commands/verifier_baisse_prix.py
from django.core.management.base import BaseCommand
from favoris.models import Favori
from notifications.models import Notification


class Command(BaseCommand):
    help = 'Vérifier les baisses de prix des favoris et notifier'

    def handle(self, *args, **options):
        """Vérifier tous les favoris avec alerte active."""
        
        favoris = Favori.objects.filter(alerte_prix_active=True).select_related(
            'client', 'vehicule'
        )
        
        count = 0
        for favori in favoris:
            if favori.verifier_baisse_prix():
                # Créer notification
                Notification.notifier_favori_prix_baisse(favori)
                count += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'{count} notification(s) de baisse de prix envoyée(s)')
        )