from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import CabinImageDestroyView, CabinViewSet, HeroImageViewSet

router = DefaultRouter()
router.register(r"hero-images", HeroImageViewSet, basename="hero-image")
router.register(r"", CabinViewSet, basename="cabin")

urlpatterns = [
    path("images/<int:pk>/", CabinImageDestroyView.as_view(), name="cabinimage-delete"),
    path("", include(router.urls)),
]
