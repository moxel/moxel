URL='moxel/redis'

CMD ?= "hello" 

push:
	docker push $(URL):`cat VERSION`
	docker push $(URL):latest

build:
	mkdir -p .build
	cp -rf ../../moxel-drivers .build
	cp -rf ../../moxel-clients .build
	docker build -t $(URL):`cat VERSION` .
	docker tag $(URL):`cat VERSION` $(URL):latest
