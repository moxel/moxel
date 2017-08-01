ENV ?= "python3"
CMD ?= "echo 'hello, world'"

all: .python3 .py3-tf-cpu .python3-gpu .py3-tf-gpu

.python3:
	cp -r core python3 && cd python3 && make build

.python3-gpu:
	cp -r core python3-gpu && cd python3-gpu && make build

.py3-tf-cpu: .python3
	cp -r core py3-tf-cpu && cd py3-tf-cpu && make build

.py3-caffe-cpu:
	cp -r core py3-caffe-cpu && cd py3-caffe-cpu && make build

.py3-tf-gpu: .python3-gpu
	cp -r core py3-tf-gpu && cd py3-tf-gpu && make build

push:
	cd python3 && make push
	cd py3-tf-cpu && make push
	cd python3-gpu && make push
	cd py3-tf-gpu && make push

test:
	cd $(ENV) && make test CMD="$(CMD)"

