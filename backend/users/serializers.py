from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from .models import User, Role


# ========================================
# SERIALIZER ROLE
# ========================================

class RoleSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Role."""
    
    class Meta:
        model = Role
        fields = ['id', 'nom', 'description']
        read_only_fields = ['id']


# ========================================
# SERIALIZER USER (Lecture seule)
# ========================================

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer pour afficher les informations d'un utilisateur.
    Utilisé pour GET /api/auth/profile/
    """
    
    role = RoleSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'nom', 'prenom', 'telephone', 
            'adresse', 'ville', 'code_postal', 'photo_profil',
            'role', 'type_utilisateur', 
            'date_inscription', 'derniere_connexion',
            # Champs spécifiques selon le type
            'nom_entreprise', 'siret', 'site_web', 'logo_entreprise',
            'est_valide', 'niveau_acces',
            # NOUVEAU : Progression profil
            'statut_compte', 'pourcentage_completion', 'raison_rejet'
        ]
        read_only_fields = [
            'id', 'date_inscription', 'derniere_connexion', 
            'est_valide', 'statut_compte', 'pourcentage_completion'
        ]
    
    def to_representation(self, instance):
        """
        Personnaliser la représentation selon le type d'utilisateur.
        Ne renvoyer que les champs pertinents.
        """
        data = super().to_representation(instance)
        
        # Si c'est un client, supprimer les champs concessionnaire/admin
        if instance.type_utilisateur == 'CLIENT':
            fields_to_remove = [
                'nom_entreprise', 'siret', 'site_web', 'logo_entreprise',
                'est_valide', 'niveau_acces'
            ]
            for field in fields_to_remove:
                data.pop(field, None)
        
        # Si c'est un concessionnaire, supprimer les champs admin
        elif instance.type_utilisateur == 'CONCESSIONNAIRE':
            data.pop('niveau_acces', None)
        
        # Si c'est un admin, supprimer les champs concessionnaire
        elif instance.type_utilisateur == 'ADMINISTRATEUR':
            fields_to_remove = [
                'nom_entreprise', 'siret', 'site_web', 'logo_entreprise'
            ]
            for field in fields_to_remove:
                data.pop(field, None)
        
        return data

# ========================================
# SERIALIZER PROGRESSION PROFIL
# ========================================

class ProfileProgressSerializer(serializers.ModelSerializer):
    """
    Serializer pour afficher la progression du profil.
    """
    
    etapes_manquantes = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'pourcentage_completion',
            'statut_compte',
            'etapes_manquantes',
            'raison_rejet'
        ]
    
    def get_etapes_manquantes(self, obj):
        """Retourner les étapes manquantes."""
        return obj.get_etapes_manquantes()
# ========================================
# SERIALIZER INSCRIPTION (Register) - SIMPLIFIÉ
# ========================================

class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer pour l'inscription d'un nouvel utilisateur.
    POST /api/auth/register/
    
    NOUVEAU : Inscription simplifiée - seulement 5 champs requis
    """
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        label="Confirmation mot de passe"
    )
    
    class Meta:
        model = User
        fields = [
            'email', 'password', 'password2', 
            'nom', 'prenom', 'type_utilisateur'
        ]
    
    def validate(self, attrs):
        """Validation globale."""
        
        # Vérifier que les mots de passe correspondent
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                "password": "Les mots de passe ne correspondent pas."
            })
        
        # On ne peut pas s'inscrire comme ADMINISTRATEUR via l'API
        type_user = attrs.get('type_utilisateur', 'CLIENT')
        if type_user == 'ADMINISTRATEUR':
            raise serializers.ValidationError({
                "type_utilisateur": "Vous ne pouvez pas vous inscrire comme administrateur."
            })
        
        return attrs
    
    def create(self, validated_data):
        """Créer l'utilisateur."""
        
        # Retirer password2
        validated_data.pop('password2')
        password = validated_data.pop('password')
        
        # Déterminer le rôle par défaut selon le type
        type_user = validated_data.get('type_utilisateur', 'CLIENT')
        
        if type_user == 'CLIENT':
            role = Role.objects.get(nom='CLIENT')
        elif type_user == 'CONCESSIONNAIRE':
            role = Role.objects.get(nom='CONCESSIONNAIRE_PROPRIETAIRE')
        else:
            raise serializers.ValidationError("Type d'utilisateur invalide")
        
        # Créer l'utilisateur
        user = User.objects.create_user(
            password=password,
            role=role,
            **validated_data
        )
        
        # Le pourcentage et statut sont calculés automatiquement dans save()
        
        return user

# ========================================
# SERIALIZER CONNEXION (Login)
# ========================================

class LoginSerializer(serializers.Serializer):
    """
    Serializer pour la connexion.
    POST /api/auth/login/
    """
    
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Vérifier les identifiants."""
        
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            # Authentifier l'utilisateur
            user = authenticate(
                request=self.context.get('request'),
                username=email,  # Django utilise 'username' mais notre champ est 'email'
                password=password
            )
            
            if not user:
                raise serializers.ValidationError(
                    "Email ou mot de passe incorrect.",
                    code='authorization'
                )
            
            if not user.is_active:
                raise serializers.ValidationError(
                    "Ce compte est désactivé.",
                    code='authorization'
                )
            
            '''# Si c'est un concessionnaire, vérifier la validation
            if user.type_utilisateur == 'CONCESSIONNAIRE' and not user.est_valide:
                raise serializers.ValidationError(
                    "Votre compte concessionnaire est en attente de validation par un administrateur.",
                    code='authorization'
                )'''
        
        else:
            raise serializers.ValidationError(
                "Email et mot de passe requis.",
                code='authorization'
            )
        
        attrs['user'] = user
        return attrs


# ========================================
# SERIALIZER MODIFICATION PROFIL
# ========================================

# ========================================
# SERIALIZER MODIFICATION PROFIL
# ========================================

class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer pour modifier le profil utilisateur.
    PUT/PATCH /api/auth/profile/
    """
    
    class Meta:
        model = User
        fields = [
            'nom', 'prenom', 'telephone', 'adresse', 
            'ville', 'code_postal', 'photo_profil',
            # Champs spécifiques concessionnaire
            'site_web', 'description_entreprise',
            'logo_entreprise',
            # Champs spécifiques client
            'newsletter_acceptee', 'preferences_notifications'
        ]
    
    def get_fields(self):
        """
        Personnaliser les champs selon le type d'utilisateur.
        """
        fields = super().get_fields()
        user = self.instance
        
        if user:
            # Si c'est un client, supprimer les champs concessionnaire
            if user.type_utilisateur == 'CLIENT':
                fields_to_remove = ['site_web', 'description_entreprise', 'logo_entreprise']
                for field in fields_to_remove:
                    fields.pop(field, None)
            
            # Si c'est un concessionnaire, supprimer les champs client
            elif user.type_utilisateur == 'CONCESSIONNAIRE':
                fields_to_remove = ['newsletter_acceptee', 'preferences_notifications']
                for field in fields_to_remove:
                    fields.pop(field, None)
        
        return fields
    
    def validate(self, attrs):
        """Validation selon le type d'utilisateur."""
        user = self.instance
        
        # Vérifier qu'on ne modifie pas les champs interdits
        forbidden_fields = ['nom_entreprise', 'siret', 'email', 'type_utilisateur', 'role']
        
        for field in forbidden_fields:
            if field in attrs:
                raise serializers.ValidationError({
                    field: "Vous ne pouvez pas modifier ce champ."
                })
        
        return attrs


# ========================================
# SERIALIZER CHANGEMENT MOT DE PASSE
# ========================================

class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer pour changer le mot de passe.
    POST /api/auth/change-password/
    """
    
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password2 = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate_old_password(self, value):
        """Vérifier que l'ancien mot de passe est correct."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Ancien mot de passe incorrect.")
        return value
    
    def validate(self, attrs):
        """Vérifier que les nouveaux mots de passe correspondent."""
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({
                "new_password": "Les nouveaux mots de passe ne correspondent pas."
            })
        return attrs
    
    def save(self, **kwargs):
        """Changer le mot de passe."""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
