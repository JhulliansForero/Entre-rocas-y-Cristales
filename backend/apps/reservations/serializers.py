from datetime import date
from decimal import Decimal

from rest_framework import serializers

from apps.cabins.serializers import CabinListSerializer
from apps.users.serializers import ProfileSerializer
from .models import Reservation

CLEANING_FEE = Decimal("40000")
TAX_RATE     = Decimal("0.08")


class ReservationSerializer(serializers.ModelSerializer):
    guest_detail = ProfileSerializer(source="guest", read_only=True)
    cabin_detail = CabinListSerializer(source="cabin", read_only=True)
    nights       = serializers.ReadOnlyField()

    class Meta:
        model  = Reservation
        fields = [
            "id", "reservation_id",
            "guest", "guest_detail",
            "cabin", "cabin_detail",
            "check_in", "check_out", "nights",
            "guests_count", "total_price", "status", "notes",
            "payment_method",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "reservation_id", "guest",
            "total_price", "created_at", "updated_at",
        ]

    def validate_check_in(self, value):
        if value < date.today():
            raise serializers.ValidationError(
                "La fecha de entrada no puede ser en el pasado."
            )
        return value

    def validate(self, data):
        # Resolve fields (support partial updates)
        instance   = self.instance
        check_in   = data.get("check_in")   or (instance and instance.check_in)
        check_out  = data.get("check_out")  or (instance and instance.check_out)
        cabin      = data.get("cabin")      or (instance and instance.cabin)
        guests_cnt = data.get("guests_count") or (instance and instance.guests_count)

        if not (check_in and check_out):
            return data

        if check_out <= check_in:
            raise serializers.ValidationError(
                {"check_out": "La fecha de salida debe ser posterior a la de entrada."}
            )

        if cabin and guests_cnt and guests_cnt > cabin.capacity:
            raise serializers.ValidationError(
                {"guests_count": f"Capacidad máxima: {cabin.capacity} huéspedes."}
            )

        # Overlap check
        if cabin:
            qs = Reservation.objects.filter(
                cabin=cabin,
                status=Reservation.STATUS_ACTIVE,
                check_in__lt=check_out,
                check_out__gt=check_in,
            )
            if instance:
                qs = qs.exclude(pk=instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    {"check_in": "La cabaña no está disponible en esas fechas."}
                )

        # Auto-calculate total price
        if cabin:
            nights = (check_out - check_in).days
            subtotal = cabin.price_per_night * nights
            data["total_price"] = subtotal + CLEANING_FEE + (subtotal * TAX_RATE)

        return data

    def create(self, validated_data):
        validated_data["guest"] = self.context["request"].user
        return super().create(validated_data)
