DEPLOYMENT_NAME=docker-test
DOCKER_IMAGE=hello-node:v2

# make sure you run `eval $(minikube docker-env)` first.
start-dev:
	minikube start
stop-dev:
	minikube stop
dev-build:
	bash -c "eval $(minikube docker-env) && docker build -t $(DOCKER_IMAGE) ."
dev-list-docker-images:
	bash -c "eval $(minikube docker-env) && docker image ls"
create-deployment:
	kubectl run $(DEPLOYMENT_IMAGE) --image=$(DOCKER_IMAGE) --port=8080
	make view-deployments
view-deployments:
	kubectl get deployments
update-deployment:
	kubectl rolling-update $(DEPLOYMENT_IMAGE) --image=image:v2
