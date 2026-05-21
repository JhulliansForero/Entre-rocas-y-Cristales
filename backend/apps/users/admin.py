from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display  = ["email", "first_name", "last_name", "role", "is_active", "date_joined"]
    list_filter   = ["role", "is_active", "is_superuser"]
    search_fields = ["email", "first_name", "last_name"]
    ordering      = ["-date_joined"]

    fieldsets = UserAdmin.fieldsets + (
        ("Información adicional", {
            "fields": ("phone", "document_number", "role", "avatar")
        }),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields":  ("email", "first_name", "last_name", "password1", "password2", "role"),
        }),
    )
