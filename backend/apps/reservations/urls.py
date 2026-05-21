from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import AdminReservationCreateView, AnalyticsView, ReservationViewSet

router = DefaultRouter()
router.register(r"", ReservationViewSet, basename="reservation")

urlpatterns = [
    path("analytics/",    AnalyticsView.as_view(),              name="analytics"),
    path("admin-create/", AdminReservationCreateView.as_view(), name="admin-create"),
    path("", include(router.urls)),
]
