.PHONY: start start-dev stop restart restart-dev logs logs-dev build

start:
	docker compose up --build -d

start-dev:
	docker compose -f docker-compose.dev.yml up -d

stop:
	docker compose down

restart: stop start

restart-dev: stop start-dev

logs:
	docker compose logs -f

logs-dev:
	docker compose -f docker-compose.dev.yml logs -f

build:
	docker compose build
