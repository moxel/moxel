build:
	python generate_yml.py

deploy:
	kubectl delete -f credentials.yml
	kubectl create -f credentials.yml
