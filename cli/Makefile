.PHONY: bulid, test, install, release, test

install:
	./manage.py install	

build-osx:
	GOARCH=amd64 GOOS=darwin ./manage.py build
	mkdir -p bin/release/osx
	cp -f bin/moxel bin/release/osx/moxel

build-linux:
	GOARCH=amd64 GOOS=linux ./manage.py build
	mkdir -p bin/release/linux
	cp -f bin/moxel bin/release/linux/moxel

build-windows:
	GOARCH=amd64 GOOS=windows ./manage.py build
	mkdir -p bin/release/windows
	cp -f bin/moxel bin/release/windows/moxel

build-release:  build-linux build-windows build-osx
	@echo "All versions built".

link:
	ln -s `pwd`/bin/moxel /usr/local/bin/moxel

build:
	./manage.py build
	
clean:
	./manage.py clean

test:
	./manage.py test ${ARGS}

release: 
	@for i in  osx linux windows ; do \
		gsutil cp bin/release/$$i/moxel gs://dummy-release/cli/`cat VERSION`/$$i/ ; \
		echo "Distribute the following link:"; \
		echo; \
		echo "curl -o moxel http://beta.dummy.ai/release/cli/`cat VERSION`/$$i/moxel"; \
	 done;



	
