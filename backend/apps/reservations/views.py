from datetime import date

from django.db.models import Count, Sum
from django.db.models.functions import ExtractYear, TruncMonth
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsAdminRole, IsOwnerOrAdmin
from .models import Reservation
from .serializers import ReservationSerializer

_MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
              'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']


class AdminReservationCreateView(APIView):
    """Creación manual de reserva por el admin (cliente sin cuenta / walk-in)."""
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request):
        import secrets
        from decimal import Decimal
        from apps.users.models import User
        from apps.cabins.models import Cabin

        # ── Huésped ───────────────────────────────────────────────────────
        guest_email = request.data.get('guest_email', '').strip().lower()
        guest_name  = request.data.get('guest_name',  '').strip()
        guest_phone = request.data.get('guest_phone', '').strip()

        if not guest_email:
            return Response({'guest_email': 'El email del huésped es obligatorio.'}, status=400)

        parts = guest_name.split() if guest_name else []
        first = parts[0] if parts else ''
        last  = ' '.join(parts[1:]) if len(parts) > 1 else ''

        user, created = User.objects.get_or_create(
            email=guest_email,
            defaults={
                'first_name': first,
                'last_name':  last,
                'phone':      guest_phone,
                'role':       User.ROLE_CLIENT,
                'is_active':  True,
            }
        )
        if created:
            user.set_password(secrets.token_urlsafe(16))
            user.save(update_fields=['password'])
        elif guest_name and not user.first_name:
            user.first_name = first
            user.last_name  = last
            user.save(update_fields=['first_name', 'last_name'])

        # ── Cabaña ────────────────────────────────────────────────────────
        cabin_id = request.data.get('cabin')
        try:
            cabin = Cabin.objects.get(pk=cabin_id)
        except (Cabin.DoesNotExist, TypeError):
            return Response({'cabin': 'Cabaña no encontrada.'}, status=400)

        # ── Fechas ────────────────────────────────────────────────────────
        try:
            check_in  = date.fromisoformat(request.data['check_in'])
            check_out = date.fromisoformat(request.data['check_out'])
        except (KeyError, ValueError):
            return Response({'check_in': 'Fechas inválidas. Usa YYYY-MM-DD.'}, status=400)

        if check_out <= check_in:
            return Response(
                {'check_out': 'La salida debe ser posterior a la entrada.'},
                status=400,
            )

        # ── Precio ────────────────────────────────────────────────────────
        nights = (check_out - check_in).days
        total_price = cabin.price_per_night * nights
        raw_price = request.data.get('total_price')
        if raw_price:
            try:
                total_price = Decimal(str(raw_price))
            except Exception:
                pass

        # ── Crear reserva ─────────────────────────────────────────────────
        reservation = Reservation.objects.create(
            guest=user,
            cabin=cabin,
            check_in=check_in,
            check_out=check_out,
            guests_count=int(request.data.get('guests_count', 1)),
            total_price=total_price,
            status=request.data.get('status', Reservation.STATUS_ACTIVE),
            notes=request.data.get('notes', ''),
            payment_method=request.data.get('payment_method', ''),
        )
        return Response(
            ReservationSerializer(reservation, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class ReservationViewSet(viewsets.ModelViewSet):
    serializer_class = ReservationSerializer
    filter_backends  = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["status", "cabin"]
    ordering_fields  = ["check_in", "check_out", "created_at", "total_price"]
    ordering         = ["-created_at"]

    def get_queryset(self):
        user = self.request.user
        qs   = Reservation.objects.select_related("guest", "cabin")
        if user.is_admin_role:
            return qs.all()
        return qs.filter(guest=user)

    def get_permissions(self):
        if self.action in ["retrieve", "update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsOwnerOrAdmin()]
        return [IsAuthenticated()]

    def destroy(self, request, *args, **kwargs):
        """Soft-cancel instead of hard delete."""
        reservation = self.get_object()
        if reservation.status == Reservation.STATUS_CANCELLED:
            return Response(
                {"detail": "Esta reserva ya está cancelada."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        reservation.status = Reservation.STATUS_CANCELLED
        reservation.save()
        return Response(
            {
                "detail":         "Reserva cancelada correctamente.",
                "reservation_id": reservation.reservation_id,
            },
            status=status.HTTP_200_OK,
        )


class AnalyticsView(APIView):
    """Dashboard de análisis de ventas — solo admin."""
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        # ── Year param ────────────────────────────────────────────────────
        try:
            selected_year = int(request.query_params.get('year', date.today().year))
        except (ValueError, TypeError):
            selected_year = date.today().year

        non_cancelled = Reservation.objects.exclude(status=Reservation.STATUS_CANCELLED)

        # ── Summary (todos los tiempos) ───────────────────────────────────
        agg = non_cancelled.aggregate(
            total_revenue=Sum('total_price'),
            total_bookings=Count('id'),
        )
        total_rev   = float(agg['total_revenue'] or 0)
        total_books = agg['total_bookings'] or 0

        # ── Mensual (año seleccionado) ────────────────────────────────────
        monthly_qs = list(
            non_cancelled
            .filter(check_in__year=selected_year)
            .annotate(month=TruncMonth('check_in'))
            .values('month')
            .annotate(revenue=Sum('total_price'), bookings=Count('id'))
            .order_by('month')
        )
        monthly_map = {
            row['month'].month: {
                'revenue':  float(row['revenue'] or 0),
                'bookings': row['bookings'],
            }
            for row in monthly_qs
        }
        monthly = [
            {
                'month':    m,
                'label':    _MONTHS_ES[m - 1],
                **monthly_map.get(m, {'revenue': 0.0, 'bookings': 0}),
            }
            for m in range(1, 13)
        ]

        # ── Anual (todos los tiempos) ─────────────────────────────────────
        annual_qs = list(
            non_cancelled
            .annotate(yr=ExtractYear('check_in'))
            .values('yr')
            .annotate(revenue=Sum('total_price'), bookings=Count('id'))
            .order_by('yr')
        )
        annual = [
            {
                'year':     row['yr'],
                'label':    str(row['yr']),
                'revenue':  float(row['revenue'] or 0),
                'bookings': row['bookings'],
            }
            for row in annual_qs
        ]
        years_available = sorted({row['yr'] for row in annual_qs}) or [date.today().year]

        # ── Por cabaña (todos los tiempos) ───────────────────────────────
        cabin_qs = (
            non_cancelled
            .values('cabin__pk', 'cabin__name', 'cabin__accent_color')
            .annotate(revenue=Sum('total_price'), bookings=Count('id'))
            .order_by('-bookings')
        )
        by_cabin = [
            {
                'id':           row['cabin__pk'],
                'name':         row['cabin__name'],
                'accent_color': row['cabin__accent_color'] or '#4a6650',
                'revenue':      float(row['revenue'] or 0),
                'bookings':     row['bookings'],
            }
            for row in cabin_qs
        ]

        return Response({
            'selected_year':   selected_year,
            'years_available': years_available,
            'summary': {
                'total_revenue':      total_rev,
                'total_bookings':     total_books,
                'avg_booking_value':  (total_rev / total_books) if total_books else 0.0,
                'active_bookings':    Reservation.objects.filter(
                    status=Reservation.STATUS_ACTIVE).count(),
                'completed_bookings': Reservation.objects.filter(
                    status=Reservation.STATUS_COMPLETED).count(),
                'cancelled_bookings': Reservation.objects.filter(
                    status=Reservation.STATUS_CANCELLED).count(),
            },
            'monthly':  monthly,
            'annual':   annual,
            'by_cabin': by_cabin,
        })
