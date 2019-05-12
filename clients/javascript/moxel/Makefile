.PHONY: test

test:
	mocha "./test/*.js"

build:
	npm run build
	browserify lib/index.js -o bundle.js

RELEASE_URL=dummy-release/js/`cat package.json | sed -E -n 's/^.*version": "(.*)".*$$/\1/p'`

release:
	node_modules/.bin/uglifyjs --compress --mangle -- bundle.js > bundle.min.js
	gsutil cp bundle.js gs://$(RELEASE_URL)/moxel.js ;
	gsutil cp bundle.min.js gs://$(RELEASE_URL)/moxel.min.js ;
	@echo "Moxel JS Client CDN: https://storage.googleapis.com/$(RELEASE_URL)/moxel.min.js"


