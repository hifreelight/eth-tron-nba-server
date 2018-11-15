build:
	docker build -t svc-rand .
push:
	docker push svc-rand
start:
	docker-compose up -d
restart:
	docker-compose down
	docker-compose up -d
logs:
	docker-compose logs -f svc-rand
exec:
	docker-compose exec svc-rand sh
