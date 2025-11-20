from django.apps import AppConfig


class ConcessionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'concessions'
    verbose_name = 'Gestion des Concessions'
    
    def ready(self):
        """
        Méthode appelée lors du démarrage de l'application.
        Utilisée pour enregistrer les signaux si nécessaire.
        """
        # Import des signaux (si vous en créez plus tard)
        # import concessions.signals
        pass