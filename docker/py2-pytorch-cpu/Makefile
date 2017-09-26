IMAGE='py2-pytorch-cpu'
URL='moxel/$(IMAGE)'

test:
	docker run -ti --privileged -v `pwd`/../../:/code -v `pwd`/../secrets/:/secrets $(URL) --asset_root `pwd` --cmd 'python /code/docker/$(IMAGE)/test.py'

push:
	docker push $(URL):`cat VERSION`
	docker push $(URL):latest

build:
	mkdir -p .build
	cp -rf ../../moxel-drivers .build
	cp -rf ../../moxel-clients .build
	docker build -t $(URL):`cat VERSION` .
	docker tag $(URL):`cat VERSION` $(URL):latest
