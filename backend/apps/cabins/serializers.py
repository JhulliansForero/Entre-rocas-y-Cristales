from rest_framework import serializers
from .models import Cabin, CabinImage, HeroImage


class CabinImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model  = CabinImage
        fields = ["id", "image", "caption", "order"]

    def get_image(self, obj):
        # Primero intentar la URL externa, luego el archivo subido
        if obj.image_url:
            return obj.image_url
        if obj.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class CabinListSerializer(serializers.ModelSerializer):
    main_image_url = serializers.SerializerMethodField()

    class Meta:
        model  = Cabin
        fields = [
            "id", "name", "short_name", "tagline", "location",
            "capacity", "bedrooms", "bathrooms", "size_sqm",
            "price_per_night", "main_image_url",
            "accent_color", "rating", "reviews_count", "is_available",
        ]

    def get_main_image_url(self, obj):
        # Prioridad: photo_url (externa) > main_image (archivo)
        if obj.photo_url:
            return obj.photo_url
        if obj.main_image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.main_image.url)
        return None


class CabinDetailSerializer(serializers.ModelSerializer):
    images         = CabinImageSerializer(many=True, read_only=True)
    main_image_url = serializers.SerializerMethodField()

    class Meta:
        model  = Cabin
        fields = [
            "id", "name", "short_name", "tagline", "description",
            "location", "capacity", "bedrooms", "bathrooms", "size_sqm",
            "price_per_night", "main_image_url",
            "accent_color", "tint", "rating", "reviews_count",
            "amenities", "experiences", "images",
            "is_available", "created_at", "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_main_image_url(self, obj):
        if obj.photo_url:
            return obj.photo_url
        if obj.main_image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.main_image.url)
        return None


class HeroImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model  = HeroImage
        fields = ["id", "image", "image_url", "caption", "order", "active", "created_at"]
        read_only_fields = ["created_at"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url
