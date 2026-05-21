from django.contrib import admin
from .models import Cabin, CabinImage


class CabinImageInline(admin.TabularInline):
    model  = CabinImage
    extra  = 1
    fields = ["image", "caption", "order"]


@admin.register(Cabin)
class CabinAdmin(admin.ModelAdmin):
    list_display  = ["name", "location", "capacity", "price_per_night", "rating", "is_available"]
    list_filter   = ["is_available", "capacity"]
    list_editable = ["is_available", "price_per_night"]
    search_fields = ["name", "short_name", "description", "location"]
    ordering      = ["name"]
    inlines       = [CabinImageInline]

    fieldsets = (
        ("Información básica", {
            "fields": ("id", "name", "short_name", "tagline", "description", "location")
        }),
        ("Capacidad y precio", {
            "fields": ("capacity", "bedrooms", "bathrooms", "size_sqm", "price_per_night")
        }),
        ("Apariencia", {
            "fields": ("main_image", "accent_color", "tint")
        }),
        ("Contenido", {
            "fields": ("amenities", "experiences")
        }),
        ("Estadísticas y estado", {
            "fields": ("rating", "reviews_count", "is_available")
        }),
    )
    readonly_fields = ["created_at", "updated_at"]
