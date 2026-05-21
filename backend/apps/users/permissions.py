from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """Permite acceso solo a usuarios con rol admin o superusuario."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_admin_role
        )


class IsOwnerOrAdmin(BasePermission):
    """Permite acceso al propietario del objeto o a cualquier admin."""

    def has_object_permission(self, request, view, obj):
        if request.user.is_admin_role:
            return True
        # Reservation → .guest   |   User → the user itself
        if hasattr(obj, "guest"):
            return obj.guest == request.user
        return obj == request.user
