URL='dummyai/warp'

.PHONY: bulid, test, install, release

docker-build:
	docker build -t $(URL):`cat VERSION` .
	docker tag $(URL):`cat VERSION` $(URL):latest

install:
	./manage.py install	

build-osx:
	GOARCH=amd64 GOOS=darwin ./manage.py build
	mkdir -p bin/release/osx
	cp -f bin/warp bin/release/osx/warp

build-linux:
	GOARCH=amd64 GOOS=linux ./manage.py build
	mkdir -p bin/release/linux
	cp -f bin/warp bin/release/linux/warp

build-windows:
	GOARCH=amd64 GOOS=windows ./manage.py build
	mkdir -p bin/release/windows
	cp -f bin/warp bin/release/windows/warp

build:  build-linux build-windows build-osx
	@echo "All versions built".
	
clean:
	./manage.py clean

test:
	./manage.py test ${ARGS}

release: 
	@for i in  osx linux windows ; do \
		gsutil cp bin/release/$$i/warp  gs://dummy-release/cli/`cat VERSION`/$$i/ ; \
	 done;

	@echo "Distribute the following link:"
	@echo
	@echo "curl -o warp https://beta.dummy.ai/release/cli/`cat VERSION`/warp"


	
