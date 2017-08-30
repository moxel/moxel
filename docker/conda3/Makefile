URL='linxifan/conda3'

push:
	docker push $(URL):`cat VERSION`
	docker push $(URL):latest

build:
	cp -rf ../core ./core
	docker build -t $(URL):`cat VERSION` .
	docker tag $(URL):`cat VERSION` $(URL):latest
