.PHONY: help build up down restart logs shell migrate seed clean

help:
	@echo "Comandos disponibles:"
	@echo "  make build    - Construir contenedores"
	@echo "  make up       - Iniciar servicios"
	@echo "  make down     - Detener servicios"
	@echo "  make restart  - Reiniciar servicios"
	@echo "  make logs     - Ver logs"
	@echo "  make shell    - Acceder al contenedor backend"
	@echo "  make migrate  - Ejecutar migraciones"
	@echo "  make seed     - Ejecutar seeders"
	@echo "  make clean    - Limpiar volúmenes y contenedores"

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

shell:
	docker exec -it megasys_backend sh

migrate:
	docker exec megasys_backend npm run migrate

seed:
	docker exec megasys_backend npm run seed

clean:
	docker-compose down -v
	docker system prune -f