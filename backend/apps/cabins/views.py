from datetime import date

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.users.permissions import IsAdminRole
from .models import Cabin, CabinImage, HeroImage
from .serializers import CabinDetailSerializer, CabinImageSerializer, CabinListSerializer, HeroImageSerializer


class CabinViewSet(viewsets.ModelViewSet):
    queryset = Cabin.objects.all()
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["is_available", "capacity"]
    search_fields    = ["name", "short_name", "tagline", "description", "location"]
    ordering_fields  = ["price_per_night", "rating", "capacity", "name"]
    ordering         = ["name"]

    def get_serializer_class(self):
        if self.action == "list":
            return CabinListSerializer
        return CabinDetailSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve", "availability"]:
            return [AllowAny()]
        return [IsAdminRole()]

    # GET /api/cabins/<id>/availability/?check_in=YYYY-MM-DD&check_out=YYYY-MM-DD
    @action(detail=True, methods=["get"])
    def availability(self, request, pk=None):
        cabin = self.get_object()
        check_in_str  = request.query_params.get("check_in")
        check_out_str = request.query_params.get("check_out")

        if check_in_str and check_out_str:
            try:
                check_in  = date.fromisoformat(check_in_str)
                check_out = date.fromisoformat(check_out_str)
            except ValueError:
                return Response(
                    {"error": "Formato inválido. Usa YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            from apps.reservations.models import Reservation
            overlapping = Reservation.objects.filter(
                cabin=cabin,
                status=Reservation.STATUS_ACTIVE,
                check_in__lt=check_out,
                check_out__gt=check_in,
            ).exists()
            return Response({
                "available":  not overlapping and cabin.is_available,
                "cabin":      cabin.id,
                "check_in":   check_in_str,
                "check_out":  check_out_str,
            })

        from apps.reservations.models import Reservation
        occupied = Reservation.objects.filter(
            cabin=cabin, status=Reservation.STATUS_ACTIVE
        ).values("check_in", "check_out")
        return Response({
            "cabin":           cabin.id,
            "is_available":    cabin.is_available,
            "occupied_ranges": list(occupied),
        })

    # ── Admin photo endpoints ─────────────────────────────────────

    # POST /api/cabins/<id>/upload_cover/   (multipart, field: cover)
    @action(detail=True, methods=["post"], permission_classes=[IsAdminRole],
            parser_classes=[MultiPartParser, FormParser], url_path="upload_cover")
    def upload_cover(self, request, pk=None):
        cabin = self.get_object()
        file  = request.FILES.get("cover")
        if not file:
            return Response({"error": "Campo 'cover' requerido."}, status=status.HTTP_400_BAD_REQUEST)
        # Delete old file if it exists
        if cabin.main_image:
            cabin.main_image.delete(save=False)
        cabin.photo_url   = ""
        cabin.main_image  = file
        cabin.save(update_fields=["main_image", "photo_url"])
        url = request.build_absolute_uri(cabin.main_image.url) if cabin.main_image else None
        return Response({"main_image_url": url}, status=status.HTTP_200_OK)

    # DELETE /api/cabins/<id>/remove_cover/
    @action(detail=True, methods=["delete"], permission_classes=[IsAdminRole],
            url_path="remove_cover")
    def remove_cover(self, request, pk=None):
        cabin = self.get_object()
        if cabin.main_image:
            cabin.main_image.delete(save=False)
            cabin.main_image = None
        cabin.photo_url = ""
        cabin.save(update_fields=["main_image", "photo_url"])
        return Response(status=status.HTTP_204_NO_CONTENT)

    # POST /api/cabins/<id>/add_image/   (multipart, field: image, optional: caption, order)
    @action(detail=True, methods=["post"], permission_classes=[IsAdminRole],
            parser_classes=[MultiPartParser, FormParser], url_path="add_image")
    def add_image(self, request, pk=None):
        cabin   = self.get_object()
        file    = request.FILES.get("image")
        caption = request.data.get("caption", "")
        order   = int(request.data.get("order", 0))
        if not file:
            return Response({"error": "Campo 'image' requerido."}, status=status.HTTP_400_BAD_REQUEST)
        img = CabinImage.objects.create(cabin=cabin, image=file, caption=caption, order=order)
        serializer = CabinImageSerializer(img, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CabinImageDestroyView(generics.DestroyAPIView):
    """DELETE /api/cabins/images/<pk>/"""
    queryset         = CabinImage.objects.all()
    permission_classes = [IsAdminRole]

    def perform_destroy(self, instance):
        if instance.image:
            instance.image.delete(save=False)
        instance.delete()


class HeroImageViewSet(viewsets.ModelViewSet):
    """
    GET  /api/hero-images/        → lista (público)
    POST /api/hero-images/        → subir imagen (admin, multipart)
    PATCH/PUT /api/hero-images/id/ → actualizar orden/caption/active (admin)
    DELETE /api/hero-images/id/   → eliminar (admin)
    """
    serializer_class = HeroImageSerializer
    parser_classes   = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        if self.request.user and getattr(self.request.user, "role", None) == "admin":
            return HeroImage.objects.all()
        return HeroImage.objects.filter(active=True)

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAdminRole()]

    def perform_destroy(self, instance):
        if instance.image:
            instance.image.delete(save=False)
        instance.delete()
