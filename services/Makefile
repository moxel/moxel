URL='moxel/email'

.PHONY: build cors

build:
	docker build -t $(URL):`cat VERSION` .
	docker tag $(URL):`cat VERSION` $(URL):latest

shell: 
	@ls /tmp/moxel_credentials || python mount_secrets.py
	docker run -v `pwd`:/app -v /tmp/moxel_credentials:/etc/credentials --entrypoint /bin/bash -it $(URL) 

