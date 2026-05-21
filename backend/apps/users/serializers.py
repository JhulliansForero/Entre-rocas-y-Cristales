from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password         = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = [
            "email", "first_name", "last_name",
            "phone", "document_number",
            "password", "confirm_password",
        ]

    def validate_email(self, value):
        email = value.lower()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("Ya existe una cuenta con este correo.")
        return email

    def validate(self, data):
        if data["password"] != data.pop("confirm_password"):
            raise serializers.ValidationError(
                {"confirm_password": "Las contraseñas no coinciden."}
            )
        return data

    def create(self, validated_data):
        # Usamos User() + set_password + save() para evitar el problema de
        # que el UserManager por defecto exige 'username' como primer argumento.
        # User.save() genera el username automáticamente desde el email.
        user = User(
            email           = validated_data["email"],
            first_name      = validated_data["first_name"],
            last_name       = validated_data["last_name"],
            phone           = validated_data.get("phone", ""),
            document_number = validated_data.get("document_number", ""),
            role            = User.ROLE_CLIENT,
        )
        user.set_password(validated_data["password"])
        user.save()
        return user


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = [
            "id", "email", "first_name", "last_name",
            "phone", "document_number", "role", "avatar",
            "date_joined",
        ]
        read_only_fields = ["id", "email", "role", "date_joined"]


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Extiende la respuesta del login para incluir el perfil del usuario."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = ProfileSerializer(self.user).data
        return data
