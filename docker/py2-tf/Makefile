URL='moxel/py2-tf'

CMD ?= "hello" 
WORKDIR=${CURDIR}

push:
	docker push $(URL):`cat VERSION`
	docker push $(URL):latest

build:
	docker build --build-arg DATE="`date`" -t $(URL):`cat VERSION` .
	docker tag $(URL):`cat VERSION` $(URL):latest

clean:
	rm -rf .build
