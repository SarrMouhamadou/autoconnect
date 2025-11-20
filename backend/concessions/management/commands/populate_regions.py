from django.core.management.base import BaseCommand
from concessions.models import Region


class Command(BaseCommand):
    help = 'Peuple la base de données avec les 14 régions du Sénégal'

    def handle(self, *args, **kwargs):
        """
        Crée les 14 régions administratives du Sénégal avec leurs coordonnées GPS.
        """
        
        regions_data = [
            {
                'nom': 'Dakar',
                'code': 'DK',
                'description': 'Capitale du Sénégal, centre économique et administratif',
                'latitude': 14.7167,
                'longitude': -17.4677
            },
            {
                'nom': 'Thiès',
                'code': 'TH',
                'description': 'Deuxième plus grande ville, proche de Dakar',
                'latitude': 14.7886,
                'longitude': -16.9260
            },
            {
                'nom': 'Saint-Louis',
                'code': 'SL',
                'description': 'Ancienne capitale, ville historique classée UNESCO',
                'latitude': 16.0179,
                'longitude': -16.4897
            },
            {
                'nom': 'Diourbel',
                'code': 'DB',
                'description': 'Capitale religieuse, ville sainte du mouridisme',
                'latitude': 14.6525,
                'longitude': -16.2294
            },
            {
                'nom': 'Louga',
                'code': 'LG',
                'description': 'Région du nord-ouest',
                'latitude': 15.6167,
                'longitude': -16.2167
            },
            {
                'nom': 'Fatick',
                'code': 'FK',
                'description': 'Région du centre, zone agricole',
                'latitude': 14.3347,
                'longitude': -16.4111
            },
            {
                'nom': 'Kaolack',
                'code': 'KL',
                'description': 'Carrefour commercial important',
                'latitude': 14.1500,
                'longitude': -16.0667
            },
            {
                'nom': 'Tambacounda',
                'code': 'TC',
                'description': 'Région de l\'est, la plus grande en superficie',
                'latitude': 13.7667,
                'longitude': -13.6667
            },
            {
                'nom': 'Kolda',
                'code': 'KD',
                'description': 'Région du sud, zone forestière',
                'latitude': 12.8833,
                'longitude': -14.9500
            },
            {
                'nom': 'Ziguinchor',
                'code': 'ZG',
                'description': 'Capitale de la Casamance',
                'latitude': 12.5833,
                'longitude': -16.2667
            },
            {
                'nom': 'Matam',
                'code': 'MT',
                'description': 'Région du nord-est, vallée du fleuve Sénégal',
                'latitude': 15.6556,
                'longitude': -13.2553
            },
            {
                'nom': 'Kaffrine',
                'code': 'KF',
                'description': 'Région créée en 2008, zone agricole',
                'latitude': 14.1061,
                'longitude': -15.5508
            },
            {
                'nom': 'Kédougou',
                'code': 'KE',
                'description': 'Région du sud-est, zone minière et montagneuse',
                'latitude': 12.5569,
                'longitude': -12.1750
            },
            {
                'nom': 'Sédhiou',
                'code': 'SE',
                'description': 'Région de la Casamance, zone agricole',
                'latitude': 12.7081,
                'longitude': -15.5569
            },
        ]
        
        created_count = 0
        updated_count = 0
        
        for region_data in regions_data:
            region, created = Region.objects.update_or_create(
                code=region_data['code'],
                defaults=region_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Région créée: {region.nom}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'↻ Région mise à jour: {region.nom}')
                )
        
        self.stdout.write('\n' + '='*50)
        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Terminé! {created_count} région(s) créée(s), {updated_count} mise(s) à jour'
            )
        )
        self.stdout.write('='*50 + '\n')