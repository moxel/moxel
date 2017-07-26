URL='dummyai/master-server'

docker-build:
	docker build -t $(URL):`cat VERSION` .
	docker tag $(URL):`cat VERSION` $(URL):latest

install:
	./manage.py install	

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

ssh:
	ssh -ti secrets/warpdrive warp@master-dev.dummy.ai "source ~/.profile; cd ~/master-server; bash"

sync:
	rsync -e "ssh -i secrets/warpdrive" -rvL --exclude=bin --exclude=*.build ./ warp@master-dev.dummy.ai:~/master-server

deploy: sync
	ssh -ti secrets/warpdrive warp@master-dev.dummy.ai "source ~/.profile; cd ~/master-server; make build && make run"

deploy-test: sync
	ssh -ti secrets/warpdrive warp@master-dev.dummy.ai "source ~/.profile; cd ~/master-server; make build && make test ARGS=\"${ARGS}\""

