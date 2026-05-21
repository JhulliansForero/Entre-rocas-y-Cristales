from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include([
        path("health/",       include("apps.core.urls")),
        path("auth/",         include("apps.users.urls")),
        path("cabins/",       include("apps.cabins.urls")),
        path("reservations/", include("apps.reservations.urls")),
    ])),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
