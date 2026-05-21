from django.contrib import admin
from .models import Reservation


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display  = [
        "reservation_id", "guest", "cabin",
        "check_in", "check_out", "guests_count",
        "total_price", "status", "created_at",
    ]
    list_filter   = ["status", "cabin", "check_in"]
    search_fields = [
        "reservation_id",
        "guest__email", "guest__first_name", "guest__last_name",
    ]
    ordering        = ["-created_at"]
    readonly_fields = ["reservation_id", "total_price", "created_at", "updated_at"]

    fieldsets = (
        ("Identificación", {
            "fields": ("reservation_id", "status")
        }),
        ("Reserva", {
            "fields": ("guest", "cabin", "check_in", "check_out", "guests_count")
        }),
        ("Precio y notas", {
            "fields": ("total_price", "notes")
        }),
        ("Registro del sistema", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )
