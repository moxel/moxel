URL='dummyai/web-server'

.PHONY: build

build:
	docker build -t $(URL):`cat VERSION` .
	docker tag $(URL):`cat VERSION` $(URL):latest

shell: 
	docker run --entrypoint /bin/bash -it $(URL) 

run:
	docker run -p 3000:3000 -p 3001:3001 -ti $(URL) npm run start:browser-dev

dev:
	docker run -v `pwd`:/app -p 3000:3000 -p 3001:3001 -ti $(URL) npm run start:browser-dev

push: build
	docker push $(URL)

deploy: push
	kubectl delete deploy web-server || true
	kubectl delete service web-server || true
	kubectl create -f deploy.yml
	kubectl expose deploy web-server --name=web-server --type="LoadBalancer" --load-balancer-ip='104.198.12.10'


