import random
import string

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CLIENT = "client"
    ROLE_ADMIN  = "admin"
    ROLE_CHOICES = [
        (ROLE_CLIENT, "Cliente"),
        (ROLE_ADMIN,  "Administrador"),
    ]

    # Make username auto-generated; login is done via email
    username = models.CharField(max_length=150, unique=True, blank=True)
    email    = models.EmailField(unique=True)
    phone    = models.CharField(max_length=20, blank=True)
    document_number = models.CharField(max_length=30, blank=True)
    role   = models.CharField(max_length=10, choices=ROLE_CHOICES, default=ROLE_CLIENT)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)

    USERNAME_FIELD  = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    class Meta:
        verbose_name        = "usuario"
        verbose_name_plural = "usuarios"

    def __str__(self):
        return f"{self.get_full_name()} <{self.email}>"

    @property
    def is_admin_role(self):
        return self.role == self.ROLE_ADMIN or self.is_superuser

    def save(self, *args, **kwargs):
        # Auto-generate a unique username from the email prefix
        if not self.username:
            base = self.email.split("@")[0]
            candidate = base
            while (
                User.objects.filter(username=candidate)
                .exclude(pk=self.pk)
                .exists()
            ):
                candidate = f"{base}{''.join(random.choices(string.digits, k=4))}"
            self.username = candidate
        super().save(*args, **kwargs)
