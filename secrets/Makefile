dev:
	python generate_yml.py dev
	kubectl delete -f credentials-dev.yml || true
	kubectl create -f credentials-dev.yml

prod:
	python generate_yml.py prod
	kubectl delete -f credentials-prod.yml || true
	kubectl create -f credentials-prod.yml
