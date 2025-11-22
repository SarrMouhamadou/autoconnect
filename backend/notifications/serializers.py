# backend/notifications/serializers.py
# Serializers pour les notifications

from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer pour lire une notification.
    GET /api/notifications/
    """
    
    type_notification_display = serializers.CharField(
        source='get_type_notification_display',
        read_only=True
    )
    
    niveau_priorite_display = serializers.CharField(
        source='get_niveau_priorite_display',
        read_only=True
    )
    
    est_expiree = serializers.ReadOnlyField()
    age_en_jours = serializers.ReadOnlyField()
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'type_notification',
            'type_notification_display',
            'titre',
            'message',
            'niveau_priorite',
            'niveau_priorite_display',
            'lien',
            'texte_action',
            'est_lue',
            'date_lecture',
            'date_creation',
            'date_expiration',
            'est_expiree',
            'age_en_jours',
            'donnees_supplementaires',
        ]
        read_only_fields = [
            'date_creation',
            'date_lecture',
        ]


class NotificationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer une notification (admin uniquement).
    POST /api/notifications/
    """
    
    class Meta:
        model = Notification
        fields = [
            'destinataire',
            'type_notification',
            'titre',
            'message',
            'niveau_priorite',
            'lien',
            'texte_action',
            'donnees_supplementaires',
            'date_expiration',
        ]
    
    def validate(self, data):
        """Validation."""
        # Vérifier que le destinataire existe et est actif
        destinataire = data.get('destinataire')
        if not destinataire.is_active:
            raise serializers.ValidationError(
                "Le destinataire doit être actif"
            )
        
        return data


class MarquerLueSerializer(serializers.Serializer):
    """
    Serializer pour marquer une notification comme lue/non lue.
    """
    
    est_lue = serializers.BooleanField(required=True)