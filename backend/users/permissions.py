from rest_framework import permissions

class IsAdministrateur(permissions.BasePermission):
    """Permission pour les administrateurs uniquement."""
    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and request.user.type_utilisateur == 'ADMINISTRATEUR'
        )
    
class IsConcessionnaire(permissions.BasePermission):
    """Permission pour les concessionnaires uniquement."""
    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and request.user.type_utilisateur == 'CONCESSIONNAIRE'
        )



class IsClient(permissions.BasePermission):
    """Permission pour vérifier que l'utilisateur est un client."""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.type_utilisateur == 'CLIENT'
        )
