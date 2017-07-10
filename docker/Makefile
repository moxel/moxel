ENV ?= "python3"
CMD ?= "echo 'hello, world'"

all: .python3

.python3:
	cp -r core python3 && cd python3 && make build

test:
	cd $(ENV) && make test CMD="$(CMD)"

