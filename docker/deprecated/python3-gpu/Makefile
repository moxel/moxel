URL='moxel/python3-gpu'

CMD ?= "hello" 

test:
	docker run -ti -v /dev/fuse:/dev/fuse --privileged -v `pwd`/../core:/core -v `pwd`/../../examples/tf-models:/code -v `pwd`/../secrets:/secrets $(URL) --code_root /code --asset_root dummy/tf-object-detection/7fdc0a55f99430088190e544b334ea1981121865/ --work_path object_detection --assets ssd_mobilenet_v1_coco_11_06_2017/frozen_inference_graph.pb --cmd "$(CMD)"

push:
	docker push $(URL):`cat VERSION`
	docker push $(URL):latest

build:
	cp -rf ../core ./core
	docker build -t $(URL):`cat VERSION` .
	docker tag $(URL):`cat VERSION` $(URL):latest
