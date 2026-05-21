.PHONY: help up down build restart logs \
        shell-backend shell-db \
        migrate collectstatic createsuperuser seed

# ─── Ayuda ───────────────────────────────────────────────────
help:
	@echo ""
	@echo "  Entre Rocas y Cristales — Comandos disponibles"
	@echo "  ─────────────────────────────────────────────────"
	@echo "  make up                Levantar todos los contenedores"
	@echo "  make down              Detener y eliminar contenedores"
	@echo "  make build             Reconstruir imágenes desde cero"
	@echo "  make restart           Reiniciar todos los servicios"
	@echo "  make logs              Ver logs de todos los servicios"
	@echo "  make logs-backend      Ver logs del backend Django"
	@echo "  make logs-nginx        Ver logs de Nginx"
	@echo "  make shell-backend     Entrar al shell de Django"
	@echo "  make shell-db          Entrar a psql"
	@echo "  make migrate           Ejecutar migraciones Django"
	@echo "  make collectstatic     Recopilar archivos estáticos"
	@echo "  make createsuperuser   Crear usuario administrador"
	@echo "  make seed              Cargar datos de ejemplo (cabañas)"
	@echo ""

# ─── Docker ──────────────────────────────────────────────────
up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build --no-cache

restart:
	docker compose restart

# ─── Logs ────────────────────────────────────────────────────
logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-nginx:
	docker compose logs -f nginx

logs-db:
	docker compose logs -f db

# ─── Django ──────────────────────────────────────────────────
shell-backend:
	docker compose exec backend python manage.py shell

shell-db:
	docker compose exec db psql -U $$(grep ^DB_USER .env | cut -d= -f2) \
	  $$(grep ^DB_NAME .env | cut -d= -f2)

migrate:
	docker compose exec backend python manage.py migrate --noinput

collectstatic:
	docker compose exec backend python manage.py collectstatic --noinput

createsuperuser:
	docker compose exec backend python manage.py createsuperuser

seed:
	docker compose exec backend python manage.py loaddata initial_cabins

# ─── Producción (VPS) ────────────────────────────────────────
deploy:
	git pull origin main
	docker compose build --no-cache
	docker compose up -d
	docker compose exec backend python manage.py migrate --noinput
	docker compose exec backend python manage.py collectstatic --noinput
	@echo "✓ Despliegue completado"
