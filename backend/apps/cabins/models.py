from django.db import models


class Cabin(models.Model):
    # Slug-style primary key (e.g. "gruta-amatista") for clean URLs
    id          = models.CharField(max_length=80, primary_key=True)
    name        = models.CharField(max_length=200)
    short_name  = models.CharField(max_length=100)
    tagline     = models.CharField(max_length=200, blank=True)
    description = models.TextField()
    location    = models.CharField(max_length=200)

    capacity  = models.PositiveIntegerField()
    bedrooms  = models.PositiveIntegerField(default=1)
    bathrooms = models.PositiveIntegerField(default=1)
    size_sqm  = models.PositiveIntegerField(help_text="Superficie en m²")

    price_per_night = models.DecimalField(max_digits=12, decimal_places=2)
    main_image      = models.ImageField(upload_to="cabins/main/", null=True, blank=True)
    photo_url       = models.URLField(blank=True, help_text="URL externa de la imagen principal (cuando no hay archivo subido)")
    accent_color    = models.CharField(max_length=10, default="#5e7c34")
    tint            = models.CharField(max_length=300, blank=True)

    rating        = models.DecimalField(max_digits=3, decimal_places=2, default=5.00)
    reviews_count = models.PositiveIntegerField(default=0)

    amenities   = models.JSONField(default=list, blank=True)
    experiences = models.JSONField(default=list, blank=True)
    is_available = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = "cabaña"
        verbose_name_plural = "cabañas"
        ordering            = ["name"]

    def __str__(self):
        return self.name


class CabinImage(models.Model):
    cabin     = models.ForeignKey(Cabin, on_delete=models.CASCADE, related_name="images")
    image     = models.ImageField(upload_to="cabins/gallery/", null=True, blank=True)
    image_url = models.URLField(blank=True, help_text="URL externa cuando no hay archivo")
    caption   = models.CharField(max_length=200, blank=True)
    order     = models.PositiveIntegerField(default=0)

    class Meta:
        ordering            = ["order"]
        verbose_name        = "imagen de cabaña"
        verbose_name_plural = "imágenes de cabaña"

    def __str__(self):
        return f"{self.cabin.short_name} — imagen {self.order}"
