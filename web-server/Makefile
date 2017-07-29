URL='dummyai/web-server-landing'

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

push: 
	docker push $(URL)

deploy: 
	kubectl delete service web-server-landing || true
	kubectl delete -f deploy.yml || true
	kubectl create -f deploy.yml
	kubectl expose deploy web-server-landing --name=web-server-landing --type="LoadBalancer" 


