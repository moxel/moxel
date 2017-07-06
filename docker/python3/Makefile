URL='dummyai/python3'

CMD=${CMD:-}

dev:
	docker run -ti -v `pwd`/../scripts:/scripts -v `pwd`/../../examples/tf-bare:/code -v `pwd`/../secrets:/secrets $(URL) /scripts/init . "$(CMD)"

push:
	docker push $(URL):`cat VERSION`
	docker push $(URL):latest

build:
	docker build -t $(URL):`cat VERSION` .
	docker tag $(URL):`cat VERSION` $(URL):latest
