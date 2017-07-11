ENV ?= "python3"
CMD ?= "echo 'hello, world'"

all: .python3 .py3-tf-cpu

.python3:
	cp -r core python3 && cd python3 && make build

.py3-tf-cpu: .python3
	cp -r core py3-tf-cpu && cd py3-tf-cpu && make build

push:
	cd python3 && make push
	cd py3-tf-cpu && make push

test:
	cd $(ENV) && make test CMD="$(CMD)"

