
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),

    # APIs Authentication
    path('api/auth/', include('users.urls')),

    # APIs Véhicules
    path('api/', include('vehicules.urls')),

    # APIs Concessions
    path('api/', include('concessions.urls')),

    # APIs Demands
    path('api/', include('demands.urls')),

    # APIs Locations
    path('api/', include('locations.urls')),

    # APIs Avis
    path('api/', include('avis.urls')),

    # APIs Favoris
    path('api/', include('favoris.urls')),

    # APIs Notifications
    path('api/', include('notifications.urls')),

    # APIs Promotions
    path('api/', include('promotions.urls')),
]

# Servir les fichiers media en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
