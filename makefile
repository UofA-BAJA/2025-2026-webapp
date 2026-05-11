.PHONY: clean up down reset watch build buildMock buildReal upReal upMock no_cache

clean:
	docker container prune -f
	docker compose down -v
	docker system prune --volumes -f
	docker system prune --volumes -f
down: 
	docker compose down
	@# run python script in background
	kill $$(cat python_stream.pid) && rm python_stream.pid

up:
	@# run python script in background and save process ID to a file
	@# kill .pid just in case it is running based on control + c  exit
	@#python3 ./tools/timeseries_stream.py --serve & echo $$! > python_stream.pid
	docker compose --env-file .env up -d

watch:
	docker compose up --watch

watchMock:
	python ./tools/mock_server.py & echo $$! > python_stream.pid
	docker compose up --watch	

build:
	docker compose up --build -d
	@# run python script in background and save process ID to a file
	@#python3 radio_to_json.py --serial_port /dev/tty.usbserial-0001 & echo $$! > python_stream.pid
	@#python ./tools/mock_server.py

buildMock:
	docker compose up --build -d
	@# run python script in background and save process ID to a file
	python ./tools/mock_server.py & echo $$! > python_stream.pid

buildReal:
	docker compose up --build -d
	@# run python script in background and save process ID to a file
	python3 radio_to_json.py --serial_port /dev/tty.usbserial-0001 & echo $$! > python_stream.pid

upReal:
	docker compose --env-file .env up -d
	@# run python script in background and save process ID to a file
	python3 radio_to_json.py --serial_port /dev/tty.usbserial-0001 & echo $$! > python_stream.pid

upMock:
	docker compose --env-file .env up -d
	@# run python script in background and save process ID to a file
	python ./tools/mock_server.py & echo $$! > python_stream.pid

reset:
	docker compose down
	docker compose down -v
	docker container prune -f
	docker system prune --volumes -f

	docker compose up --build 

no_cache:
	 docker build --no-cache

