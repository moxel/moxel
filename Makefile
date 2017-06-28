URL='dummyai/mvp'


build:
	docker build -t $(URL):`cat VERSION` .
	docker tag $(URL):`cat VERSION` $(URL):latest

run:
	docker run -it $(URL)

dev:
	docker run -v `pwd`:/app -p 3000:3000 -ti $(URL)

push: build
	docker push $(URL)

deploy: push
	kubectl delete deploy mvp
	kubectl create -f deploy.yml
	kubectl expose deploy mvp  --name=mvp --type="LoadBalancer" --load-balancer-ip='104.198.12.10'


