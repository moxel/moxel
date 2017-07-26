URL='dummyai/warp'

.PHONY: bulid, test, install, release

docker-build:
	docker build -t $(URL):`cat VERSION` .
	docker tag $(URL):`cat VERSION` $(URL):latest

install:
	./manage.py install	

build:
	./manage.py build

clean:
	./manage.py clean

test:
	./manage.py test ${ARGS}

release: build
	gsutil cp bin/warp gs://dummy-release/cli/`cat VERSION`/
	@echo "Distribute the following link:"
	@echo
	@echo "curl -o warp https://beta.dummy.ai/release/cli/`cat VERSION`/warp"


	
