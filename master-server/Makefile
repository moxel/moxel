install:
	./manage.py install	

build:
	./manage.py build

clean:
	./manage.py clean

dev:
	./manage.py dev

run:
	./bin/master-server start

migrate: 
	./bin/master-server migrate

test:
	./manage.py test ${ARGS}

sync:
	rsync -e "ssh -i secrets/warpdrive" -rvL --exclude=bin --exclude=*.build ./ warp@master-dev.dummy.ai:~/master-server

