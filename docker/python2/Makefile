URL='moxel/python2'

CMD ?= "hello" 

push:
	docker push $(URL):`cat VERSION`
	docker push $(URL):latest

build:
	docker build --build-arg DATE="`date`" -t $(URL):`cat VERSION` .
	docker tag $(URL):`cat VERSION` $(URL):latest
