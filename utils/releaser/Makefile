URL='dummyai/releaser'

.PHONY: build

build:
	docker build -t $(URL):`cat VERSION` .
	docker tag $(URL):`cat VERSION` $(URL):latest

shell: 
	docker run --entrypoint /bin/bash -it $(URL) 

run:
	docker run -p 8080:8080 -ti $(URL) 

dev:
	docker run -v `pwd`:/app -p 8080:8080 -ti $(URL)

push: build
	docker push $(URL)

deploy:
	kc create -f deploy.yml
	kubectl expose deploy releaser --name=releaser --type="LoadBalancer"

teardown:
	kc delete -f deploy.yml
	kc delete service releaser

