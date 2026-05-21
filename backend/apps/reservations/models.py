import random
import string

from django.conf import settings
from django.db import models


def _generate_reservation_id():
    from datetime import date
    year = date.today().year
    for _ in range(20):
        candidate = f"ERC-{year}-{''.join(random.choices(string.digits, k=4))}"
        if not Reservation.objects.filter(reservation_id=candidate).exists():
            return candidate
    # Fallback with more digits on rare collision
    return f"ERC-{year}-{''.join(random.choices(string.digits, k=6))}"


class Reservation(models.Model):
    STATUS_ACTIVE    = "active"
    STATUS_CANCELLED = "cancelled"
    STATUS_COMPLETED = "completed"
    STATUS_CHOICES = [
        (STATUS_ACTIVE,    "Activa"),
        (STATUS_CANCELLED, "Cancelada"),
        (STATUS_COMPLETED, "Completada"),
    ]

    reservation_id = models.CharField(
        max_length=20, unique=True, editable=False, db_index=True
    )
    guest = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="reservations",
        verbose_name="huésped",
    )
    cabin = models.ForeignKey(
        "cabins.Cabin",
        on_delete=models.PROTECT,
        related_name="reservations",
        verbose_name="cabaña",
    )
    check_in      = models.DateField(verbose_name="fecha de entrada")
    check_out     = models.DateField(verbose_name="fecha de salida")
    guests_count  = models.PositiveSmallIntegerField(verbose_name="número de huéspedes")
    total_price   = models.DecimalField(
        max_digits=14, decimal_places=2, verbose_name="precio total"
    )
    status = models.CharField(
        max_length=15, choices=STATUS_CHOICES, default=STATUS_ACTIVE
    )
    notes = models.TextField(blank=True, verbose_name="notas para el anfitrión")

    PAYMENT_EFECTIVO      = "efectivo"
    PAYMENT_TRANSFERENCIA = "transferencia"
    PAYMENT_TARJETA       = "tarjeta"
    PAYMENT_OTRO          = "otro"
    PAYMENT_CHOICES = [
        (PAYMENT_EFECTIVO,      "Efectivo"),
        (PAYMENT_TRANSFERENCIA, "Transferencia bancaria"),
        (PAYMENT_TARJETA,       "Tarjeta de crédito/débito"),
        (PAYMENT_OTRO,          "Otro"),
    ]
    payment_method = models.CharField(
        max_length=20, choices=PAYMENT_CHOICES, blank=True, default="",
        verbose_name="método de pago",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = "reserva"
        verbose_name_plural = "reservas"
        ordering            = ["-created_at"]

    def __str__(self):
        return f"{self.reservation_id} — {self.guest} · {self.cabin}"

    def save(self, *args, **kwargs):
        if not self.reservation_id:
            self.reservation_id = _generate_reservation_id()
        super().save(*args, **kwargs)

    @property
    def nights(self):
        return (self.check_out - self.check_in).days
