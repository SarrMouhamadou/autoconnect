
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
]

# Servir les fichiers media en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
