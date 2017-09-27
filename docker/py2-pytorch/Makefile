IMAGE=py2-pytorch
URL=moxel/$(IMAGE)

test:
	docker run -ti --privileged -v `pwd`/../../:/code -v `pwd`/../secrets/:/secrets $(URL) --asset_root `pwd` --cmd 'python /code/docker/$(IMAGE)/test.py'

push:
	docker push $(URL):`cat VERSION`
	docker push $(URL):latest

build:
	docker build --build-arg DATE="`date`" -t $(URL):`cat VERSION` .
	docker tag $(URL):`cat VERSION` $(URL):latest
