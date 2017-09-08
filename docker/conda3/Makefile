URL='moxel/conda3'

test:
	docker run -ti --privileged -v `pwd`/../../:/code -v `pwd`/../secrets/:/secrets $(URL) --asset_root `pwd` --cmd 'python /code/docker/conda3/test.py'

push:
	docker push $(URL):`cat VERSION`
	docker push $(URL):latest

build:
	cp -rf ../core ./core
	docker build -t $(URL):`cat VERSION` .
	docker tag $(URL):`cat VERSION` $(URL):latest
