from django.core.management.base import BaseCommand
from vehicules.models import Marque, Categorie

class Command(BaseCommand):
    help = 'Initialiser marques et catégories'

    def handle(self, *args, **options):
        marques = [
            {'nom': 'Toyota', 'pays_origine': 'Japon'},
            {'nom': 'Mercedes-Benz', 'pays_origine': 'Allemagne'},
            {'nom': 'Peugeot', 'pays_origine': 'France'},
            {'nom': 'Volkswagen', 'pays_origine': 'Allemagne'},
            {'nom': 'Renault', 'pays_origine': 'France'},
        ]
        
        for m in marques:
            marque, created = Marque.objects.get_or_create(
                nom=m['nom'], defaults={'pays_origine': m['pays_origine']}
            )
            if created:
                self.stdout.write(f'✅ {marque.nom}')
        
        categories = [
            {'nom': 'Berline', 'ordre': 1},
            {'nom': 'SUV', 'ordre': 2},
            {'nom': '4x4', 'ordre': 3},
            {'nom': 'Citadine', 'ordre': 4},
            {'nom': 'Utilitaire', 'ordre': 5},
        ]
        
        for c in categories:
            cat, created = Categorie.objects.get_or_create(
                nom=c['nom'], defaults={'ordre': c['ordre']}
            )
            if created:
                self.stdout.write(f'✅ {cat.nom}')
        
        self.stdout.write(self.style.SUCCESS('✅ Terminé!'))