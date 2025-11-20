from rest_framework import permissions

class IsConcessionnaire(permissions.BasePermission):
    """Permission pour les concessionnaires uniquement."""
    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and request.user.type_utilisateur == 'CONCESSIONNAIRE'
        )

class IsAdministrateur(permissions.BasePermission):
    """Permission pour les administrateurs uniquement."""
    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and request.user.type_utilisateur == 'ADMINISTRATEUR'
        )