DC ?= docker compose

.PHONY: up down clean logs db-push

# Bring up Postgres, push Prisma schema, then start all services
up: db-push
	@echo "Starting all services..."
	@$(DC) up -d
	@echo "All services started! Backend: localhost:3001 | Frontend: localhost:3000"

# Run Prisma DB push against the compose postgres
db-push:
	@echo "Ensuring database is up..."
	@$(DC) up -d postgres
	@echo "Pushing Prisma schema..."
	@$(DC) run --rm backend npx prisma db push
	@echo "Prisma schema synced."

down:
	@echo "Stopping all services..."
	@$(DC) down
	@echo "All services stopped."

clean:
	@echo "Cleaning all containers, volumes, and networks..."
	@$(DC) down --volumes --remove-orphans --rmi local
	@echo "Clean complete."

logs:
	@$(DC) logs -f
