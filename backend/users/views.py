from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login
from django.utils import timezone
from .models import User
from favoris.models import Historique

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
    ProfileProgressSerializer
)


# ========================================
# GÉNÉRATION DE TOKENS JWT
# ========================================

def get_tokens_for_user(user):
    """
    Générer les tokens JWT (access + refresh) pour un utilisateur.
    """
    refresh = RefreshToken.for_user(user)
    
    # Ajouter des claims personnalisés
    refresh['email'] = user.email
    refresh['type_utilisateur'] = user.type_utilisateur
    refresh['role'] = user.role.nom if user.role else None
    
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


# ========================================
# API INSCRIPTION (Register)
# ========================================

class RegisterView(generics.CreateAPIView):
    """
    API d'inscription pour créer un nouveau compte.
    
    POST /api/auth/register/
    
    Permissions: Tout le monde (AllowAny)
    
    Body (Client):
    {
        "email": "client@example.com",
        "password": "MotDePasseForT123!",
        "password2": "MotDePasseForT123!",
        "nom": "Diop",
        "prenom": "Aminata",
        "telephone": "+221771234567",
        "type_utilisateur": "CLIENT"
    }
    
    Body (Concessionnaire):
    {
        "email": "concessionnaire@example.com",
        "password": "MotDePasseForT123!",
        "password2": "MotDePasseForT123!",
        "nom": "Ndiaye",
        "prenom": "Ibrahima",
        "telephone": "+221771234567",
        "type_utilisateur": "CONCESSIONNAIRE",
        "nom_entreprise": "Auto Dakar",
        "siret": "12345678901234"
    }
    
    Response:
    {
        "user": {...},
        "tokens": {
            "refresh": "...",
            "access": "..."
        },
        "message": "Inscription réussie"
    }
    """
    
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        """Créer l'utilisateur et retourner les tokens JWT."""
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Créer l'utilisateur
        user = serializer.save()
        
        # Générer les tokens JWT
        tokens = get_tokens_for_user(user)
        
        # Retourner les infos utilisateur + tokens
        user_serializer = UserSerializer(user)
        
        return Response({
            'user': user_serializer.data,
            'tokens': tokens,
            'message': 'Inscription réussie. Bienvenue sur AutoConnect !'
        }, status=status.HTTP_201_CREATED)


# ========================================
# API CONNEXION (Login)
# ========================================

class LoginView(APIView):
    """
    API de connexion.
    
    POST /api/auth/login/
    
    Permissions: Tout le monde (AllowAny)
    
    Body:
    {
        "email": "user@example.com",
        "password": "password123"
    }
    
    Response:
    {
        "user": {...},
        "tokens": {
            "refresh": "...",
            "access": "..."
        },
        "message": "Connexion réussie"
    }
    """
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Authentifier l'utilisateur et retourner les tokens."""
        
        serializer = LoginSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        # Récupérer l'utilisateur validé
        user = serializer.validated_data['user']
        
        # Mettre à jour la dernière connexion
        user.derniere_connexion = timezone.now()
        user.save(update_fields=['derniere_connexion'])
        
        # Générer les tokens JWT
        tokens = get_tokens_for_user(user)
        
        # Login Django (optionnel, pour les sessions)
        login(request, user)
        
        # Retourner les infos utilisateur + tokens
        user_serializer = UserSerializer(user)
        
        return Response({
            'user': user_serializer.data,
            'tokens': tokens,
            'message': f'Bienvenue {user.prenom} !'
        }, status=status.HTTP_200_OK)


# ========================================
# API PROFIL UTILISATEUR
# ========================================

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API pour voir et modifier son profil.
    
    GET /api/auth/profile/
    Retourne les informations de l'utilisateur connecté
    
    PUT/PATCH /api/auth/profile/
    Modifie les informations de l'utilisateur connecté
    
    Permissions: Authentifié uniquement (IsAuthenticated)
    
    Headers:
    Authorization: Bearer <access_token>
    
    Response (GET):
    {
        "id": 1,
        "email": "user@example.com",
        "nom": "Diop",
        "prenom": "Aminata",
        ...
    }
    """
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """Retourner l'utilisateur connecté."""
        return self.request.user
    
    def get_serializer_class(self):
        """Choisir le serializer selon la méthode."""
        if self.request.method == 'GET':
            return UserSerializer
        return UserUpdateSerializer
    
    def update(self, request, *args, **kwargs):
        """Modifier le profil."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # ✅ AJOUTER CES LIGNES
        # Enregistrer dans l'historique
        Historique.enregistrer_action(
            utilisateur=request.user,
            type_action='MAJ_PROFIL',
            description="Mise à jour du profil",
            request=request
        )
        
        # Retourner le profil complet mis à jour
        user_serializer = UserSerializer(instance)
    
        return Response({
            'user': user_serializer.data,
            'message': 'Profil mis à jour avec succès'
        }, status=status.HTTP_200_OK)


# ========================================
# API CHANGEMENT MOT DE PASSE
# ========================================

class ChangePasswordView(APIView):
    """
    API pour changer son mot de passe.
    
    POST /api/auth/change-password/
    
    Permissions: Authentifié uniquement
    
    Headers:
    Authorization: Bearer <access_token>
    
    Body:
    {
        "old_password": "ancienMotDePasse",
        "new_password": "NouveauMotDePasse123!",
        "new_password2": "NouveauMotDePasse123!"
    }
    
    Response:
    {
        "message": "Mot de passe modifié avec succès"
    }
    """
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Changer le mot de passe."""
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # ✅ AJOUTER CES LIGNES
        # Enregistrer dans l'historique
        Historique.enregistrer_action(
            utilisateur=request.user,
            type_action='CHANGE_PASSWORD',
            description="Changement de mot de passe",
            request=request
        )
        
        return Response({
            'message': 'Mot de passe modifié avec succès. Veuillez vous reconnecter.'
        }, status=status.HTTP_200_OK)


# ========================================
# API DÉCONNEXION (Logout)
# ========================================

class LogoutView(APIView):
    """
    API de déconnexion.
    
    POST /api/auth/logout/
    
    Permissions: Authentifié uniquement
    
    Headers:
    Authorization: Bearer <access_token>
    
    Body:
    {
        "refresh": "<refresh_token>"
    }
    
    Note: Blacklist le refresh token pour empêcher sa réutilisation
    
    Response:
    {
        "message": "Déconnexion réussie"
    }
    """
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Déconnecter l'utilisateur (blacklist le token)."""
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response({
                'message': 'Déconnexion réussie. À bientôt !'
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'error': 'Token invalide ou déjà blacklisté'
            }, status=status.HTTP_400_BAD_REQUEST)
        
# ========================================
# API PROGRESSION DU PROFIL
# ========================================

class ProfileProgressView(APIView):
    """
    API pour récupérer la progression du profil.
    
    GET /api/auth/profile/progress/
    
    Permissions: Authentifié uniquement
    
    Response:
    {
        "pourcentage_completion": 40,
        "statut_compte": "INCOMPLETE",
        "etapes_manquantes": [
            {
                "titre": "Ajouter votre numéro SIRET",
                "importance": "Haute",
                "points": "+20%"
            }
        ],
        "raison_rejet": ""
    }
    """
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Récupérer la progression du profil."""
        user = request.user
        serializer = ProfileProgressSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)