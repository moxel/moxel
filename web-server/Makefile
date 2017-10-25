URL='moxel/web-server'

.PHONY: build cors

build:
	./bin/bake-build-version
	react-scripts build
	docker build -t $(URL):`cat VERSION` .
	docker tag $(URL):`cat VERSION` $(URL):latest

shell: 
	docker run --entrypoint /bin/bash -it $(URL) 

run:
	./run.sh

dev:
	npm run start:browser-dev

push: 
	docker push $(URL)

deploy: 
	kubectl delete service web-server || true
	kubectl delete -f deploy.yml || true
	kubectl create -f deploy.yml
	kubectl expose deploy web-server --name=web-server --type="LoadBalancer" 

cors:
	gsutil cors set cors/enable-gcloud.json gs://dummy-dev
	gsutil cors set cors/enable-gcloud-asset.json gs://dummy-asset
