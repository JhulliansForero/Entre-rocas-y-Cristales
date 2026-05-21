from .base import *

DEBUG = True

ALLOWED_HOSTS = [
    h.strip()
    for h in os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1,backend").split(",")
]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME":     os.environ.get("DB_NAME",     "entre_rocas_db"),
        "USER":     os.environ.get("DB_USER",     "entre_rocas_user"),
        "PASSWORD": os.environ.get("DB_PASSWORD", "dev_password_123"),
        "HOST":     os.environ.get("DB_HOST",     "db"),
        "PORT":     os.environ.get("DB_PORT",     "5432"),
    }
}

CORS_ALLOW_ALL_ORIGINS = True
