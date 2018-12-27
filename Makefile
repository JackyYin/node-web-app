# One work at a time
MAKEFLAGS = --jobs=1

ENVFILE = .env
SOURCE_ENV = set -a; source $(ENVFILE);

DOCKER_COMPOSE = $(SOURCE_ENV) docker-compose -f $$DOCKER_COMPOSEFILE

.PHONY: up down restart logs

up:
	$(DOCKER_COMPOSE) up -d

down:
	$(DOCKER_COMPOSE) down

restart:
	make down
	make up
	make logs

logs:
	$(SOURCE_ENV) \
	docker-compose -f $$DOCKER_COMPOSEFILE logs -f
