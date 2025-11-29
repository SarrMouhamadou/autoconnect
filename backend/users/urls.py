from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    UserProfileView,
    ChangePasswordView,
    ProfileProgressView,
    ParametresView,
    MesClientsView
)

app_name = 'users'

urlpatterns = [
    # Authentification
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Profil
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('profile/progress/', ProfileProgressView.as_view(), name='profile-progress'),
    
    # Paramètres / Préférences ✅ NOUVEAU
    path('parametres/', ParametresView.as_view(), name='parametres'),
    path('mes-clients/', MesClientsView.as_view(), name='mes-clients'),
    
    # Refresh token JWT
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]