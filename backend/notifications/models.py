# backend/notifications/models.py
# Modèle pour les notifications

from django.db import models
from users.models import User


class Notification(models.Model):
    """
    Modèle représentant une notification envoyée à un utilisateur.
    ⭐ CONFORME AU DIAGRAMME DE CLASSE
    """
    
    # ========================================
    # TYPE DE NOTIFICATION CHOICES
    # ========================================
    
    TYPE_NOTIFICATION_CHOICES = [
        # Demandes
        ('DEMANDE_RECUE', 'Nouvelle demande reçue'),
        ('DEMANDE_TRAITEE', 'Demande traitée'),
        
        # Locations
        ('LOCATION_DEMANDEE', 'Nouvelle demande de location'),
        ('LOCATION_CONFIRMEE', 'Location confirmée'),
        ('LOCATION_REFUSEE', 'Location refusée'),
        ('LOCATION_DEPART', 'Départ du véhicule'),
        ('LOCATION_RETOUR', 'Retour du véhicule'),
        ('LOCATION_RETARD', 'Retard de retour'),
        
        # Avis
        ('AVIS_RECU', 'Nouvel avis reçu'),
        ('AVIS_REPONSE', 'Réponse à votre avis'),
        
        # Compte
        ('COMPTE_VALIDE', 'Compte validé'),
        ('COMPTE_REJETE', 'Compte rejeté'),
        ('COMPTE_SUSPENDU', 'Compte suspendu'),
        
        # Favoris
        ('FAVORI_PRIX_BAISSE', 'Prix d\'un favori a baissé'),
        ('FAVORI_DISPONIBLE', 'Favori disponible'),
        
        # Système
        ('INFORMATION', 'Information'),
        ('ALERTE', 'Alerte'),
        ('ERREUR', 'Erreur'),
    ]
    
    # ========================================
    # NIVEAU DE PRIORITÉ
    # ========================================
    
    NIVEAU_PRIORITE_CHOICES = [
        ('BASSE', 'Basse'),
        ('NORMALE', 'Normale'),
        ('HAUTE', 'Haute'),
        ('URGENTE', 'Urgente'),
    ]
    
    # ========================================
    # RELATIONS
    # ========================================
    
    destinataire = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name="Destinataire"
    )
    
    # ========================================
    # CONTENU
    # ========================================
    
    type_notification = models.CharField(
        max_length=50,
        choices=TYPE_NOTIFICATION_CHOICES,
        verbose_name="Type de notification"
    )
    
    titre = models.CharField(
        max_length=200,
        verbose_name="Titre"
    )
    
    message = models.TextField(
        verbose_name="Message"
    )
    
    niveau_priorite = models.CharField(
        max_length=20,
        choices=NIVEAU_PRIORITE_CHOICES,
        default='NORMALE',
        verbose_name="Niveau de priorité"
    )
    
    # ========================================
    # ACTION (optionnelle)
    # ========================================
    
    # Lien vers une page ou une action
    lien = models.CharField(
        max_length=500,
        blank=True,
        verbose_name="Lien vers une page",
        help_text="URL relative ou absolue"
    )
    
    # Texte du bouton d'action
    texte_action = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Texte du bouton d'action",
        help_text="Ex: Voir la demande, Consulter le véhicule"
    )
    
    # ========================================
    # MÉTADONNÉES
    # ========================================
    
    # Données additionnelles (JSON)
    donnees_supplementaires = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Données supplémentaires",
        help_text="Informations additionnelles en JSON"
    )
    
    # ========================================
    # STATUT
    # ========================================
    
    est_lue = models.BooleanField(
        default=False,
        verbose_name="Lue"
    )
    
    date_lecture = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date de lecture"
    )
    
    # ========================================
    # DATES
    # ========================================
    
    date_creation = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de création"
    )
    
    date_expiration = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date d'expiration",
        help_text="Notification expirée après cette date"
    )
    
    # ========================================
    # META & MÉTHODES
    # ========================================
    
    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-date_creation']
        indexes = [
            models.Index(fields=['destinataire', 'est_lue', 'date_creation']),
            models.Index(fields=['type_notification']),
            models.Index(fields=['niveau_priorite']),
        ]
    
    def __str__(self):
        statut = "✓" if self.est_lue else "●"
        return f"{statut} {self.destinataire.nom_complet} - {self.titre}"
    
    def marquer_comme_lue(self):
        """Marquer la notification comme lue."""
        if not self.est_lue:
            from django.utils import timezone
            self.est_lue = True
            self.date_lecture = timezone.now()
            self.save(update_fields=['est_lue', 'date_lecture'])
    
    def marquer_comme_non_lue(self):
        """Marquer la notification comme non lue."""
        if self.est_lue:
            self.est_lue = False
            self.date_lecture = None
            self.save(update_fields=['est_lue', 'date_lecture'])
    
    @classmethod
    def creer_notification(cls, destinataire, type_notification, titre, message, **kwargs):
        """
        Méthode utilitaire pour créer une notification.
        
        Args:
            destinataire: Instance User
            type_notification: Type de notification (choix de TYPE_NOTIFICATION_CHOICES)
            titre: Titre de la notification
            message: Message de la notification
            **kwargs: Paramètres optionnels (niveau_priorite, lien, texte_action, etc.)
        
        Returns:
            Instance Notification créée
        """
        return cls.objects.create(
            destinataire=destinataire,
            type_notification=type_notification,
            titre=titre,
            message=message,
            niveau_priorite=kwargs.get('niveau_priorite', 'NORMALE'),
            lien=kwargs.get('lien', ''),
            texte_action=kwargs.get('texte_action', ''),
            donnees_supplementaires=kwargs.get('donnees_supplementaires', {})
        )
    
    @classmethod
    def notifier_demande_recue(cls, demande):
        """Notifier le concessionnaire d'une nouvelle demande."""
        return cls.creer_notification(
            destinataire=demande.concessionnaire,
            type_notification='DEMANDE_RECUE',
            titre=f"Nouvelle demande de {demande.get_type_demande_display()}",
            message=f"{demande.client.nom_complet} a fait une demande concernant {demande.vehicule.nom_complet}",
            niveau_priorite='HAUTE',
            lien=f"/demands/{demande.id}",
            texte_action="Voir la demande",
            donnees_supplementaires={'demande_id': demande.id}
        )
    
    @classmethod
    def notifier_location_confirmee(cls, location):
        """Notifier le client que sa location est confirmée."""
        return cls.creer_notification(
            destinataire=location.client,
            type_notification='LOCATION_CONFIRMEE',
            titre="Location confirmée",
            message=f"Votre demande de location pour {location.vehicule.nom_complet} a été confirmée",
            niveau_priorite='HAUTE',
            lien=f"/locations/{location.id}",
            texte_action="Voir ma location",
            donnees_supplementaires={'location_id': location.id}
        )
    
    @classmethod
    def notifier_location_refusee(cls, location):
        """Notifier le client que sa location est refusée."""
        return cls.creer_notification(
            destinataire=location.client,
            type_notification='LOCATION_REFUSEE',
            titre="Location refusée",
            message=f"Votre demande de location pour {location.vehicule.nom_complet} a été refusée",
            niveau_priorite='NORMALE',
            lien=f"/locations/{location.id}",
            texte_action="Voir les détails",
            donnees_supplementaires={'location_id': location.id}
        )
    
    @classmethod
    def notifier_avis_recu(cls, avis):
        """Notifier le concessionnaire d'un nouvel avis."""
        return cls.creer_notification(
            destinataire=avis.vehicule.concessionnaire,
            type_notification='AVIS_RECU',
            titre=f"Nouvel avis {avis.note}★",
            message=f"{avis.client.nom_complet} a laissé un avis sur {avis.vehicule.nom_complet}",
            niveau_priorite='NORMALE',
            lien=f"/avis/{avis.id}",
            texte_action="Voir l'avis",
            donnees_supplementaires={'avis_id': avis.id}
        )
    
    @classmethod
    def notifier_avis_reponse(cls, avis):
        """Notifier le client d'une réponse à son avis."""
        return cls.creer_notification(
            destinataire=avis.client,
            type_notification='AVIS_REPONSE',
            titre="Réponse à votre avis",
            message=f"Le concessionnaire a répondu à votre avis sur {avis.vehicule.nom_complet}",
            niveau_priorite='NORMALE',
            lien=f"/avis/{avis.id}",
            texte_action="Voir la réponse",
            donnees_supplementaires={'avis_id': avis.id}
        )
    
    @classmethod
    def notifier_compte_valide(cls, user):
        """Notifier l'utilisateur que son compte est validé."""
        return cls.creer_notification(
            destinataire=user,
            type_notification='COMPTE_VALIDE',
            titre="Compte validé",
            message="Félicitations ! Votre compte concessionnaire a été validé par un administrateur",
            niveau_priorite='HAUTE',
            lien="/dashboard",
            texte_action="Accéder au tableau de bord"
        )
    
    @classmethod
    def notifier_favori_prix_baisse(cls, favori):
        """Notifier le client qu'un favori a baissé de prix."""
        if favori.difference_prix and favori.difference_prix < 0:
            return cls.creer_notification(
                destinataire=favori.client,
                type_notification='FAVORI_PRIX_BAISSE',
                titre="Prix baissé !",
                message=f"Le prix de {favori.vehicule.nom_complet} a baissé de {abs(int(favori.difference_prix)):,} FCFA",
                niveau_priorite='HAUTE',
                lien=f"/vehicules/{favori.vehicule.id}",
                texte_action="Voir le véhicule",
                donnees_supplementaires={
                    'vehicule_id': favori.vehicule.id,
                    'prix_initial': float(favori.prix_initial),
                    'difference': float(favori.difference_prix)
                }
            )
        return None
    
    @property
    def est_expiree(self):
        """Vérifier si la notification est expirée."""
        if self.date_expiration:
            from django.utils import timezone
            return timezone.now() > self.date_expiration
        return False
    
    @property
    def age_en_jours(self):
        """Calculer l'âge de la notification en jours."""
        from django.utils import timezone
        delta = timezone.now() - self.date_creation
        return delta.days