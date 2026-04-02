.PHONY: clean up down reset watch

clean:
	docker container prune -f
	docker compose down -v
	docker system prune --volumes -f
	docker system prune --volumes -f
down: 
	docker compose down
	kill $$(cat server.pid) && rm server.pid

up:
	@# run python script in background
	python3 ./tools/timeseries_stream.py --serve & echo $$! > python_stream.pid
	docker compose --env-file .env up -d

watch:
	docker compose up --watch
	
build:
	docker compose up --build -d

reset:
	docker compose down
	docker compose down -v
	docker container prune -f
	docker system prune --volumes -f

	docker compose up --build 

no_cache:
	 docker build --no-cache

