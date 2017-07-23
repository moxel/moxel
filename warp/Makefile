URL='dummyai/warp'

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

