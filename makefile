.PHONY: clean up down reset watch

clean:
	docker container prune -f
	docker system prune --volumes -f
down: 
	docker compose down

up:
	docker compose --env-file .env up -d

watch:
	docker compose up --watch
	
build:
	docker compose up --build -d

reset:
	docker compose down
# 	rm new postgres data
	docker compose down -v
	docker container prune -f
	docker system prune --volumes -f

	docker compose up --build 

no_cache:
	 docker build --no-cache

