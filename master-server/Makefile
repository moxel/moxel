URL='dummyai/master-server'

docker-build:
	GOARCH=amd64 GOOS=linux ./manage.py build
	docker build -t $(URL):`cat VERSION` .
	docker tag $(URL):`cat VERSION` $(URL):latest

docker-run:
	docker run -e ENV=local -v /tmp/code:/tmp/code -p 8080:8080 -ti $(URL):`cat VERSION` start

install:
	./manage.py install	

push: 
	docker push $(URL)

build:
	./manage.py build

clean:
	./manage.py clean

dev:
	./manage.py dev

run:
	./bin/master-server start

migrate: 
	./bin/master-server migrate

test:
	./manage.py test ${ARGS}


MASTER_DEV="35.197.60.175"

ssh:
	ssh -ti secrets-dev/warpdrive warp@$(MASTER_DEV) "source ~/.profile; cd ~/master-server; bash"

sync:
	rsync -e "ssh -i secrets-dev/warpdrive" -rvL --exclude=bin --exclude=*.build ./ warp@$(MASTER_DEV):~/master-server

deploy: 
	kubectl delete service master-server || true
	kubectl delete -f deploy.yml || true
	kubectl create -f deploy.yml
	kubectl expose deploy master-server --name=master-server --type="LoadBalancer" 

deploy-dev: sync
	ssh -ti secrets-dev/warpdrive warp@$(MASTER_DEV) "source ~/.profile; cd ~/master-server; make build && ENV=dev make run"
#
#deploy-test: sync
#	ssh -ti secrets/warpdrive warp@master-dev.dummy.ai "source ~/.profile; cd ~/master-server; make build && make test ARGS=\"${ARGS}\""
#
