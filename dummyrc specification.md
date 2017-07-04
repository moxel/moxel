# .dummyrc.yml File Specification
For the file name let's use `.dummyrc.yml` b/c the `.yml` extension will make it more recorgnizable 
to a lot of IDEs. <= let me know if you think this is uncessarrary.


## Way to create
    warp init
    > interactive wizard, asking for repositiory url etc to automatically setup the `bugs`and `repository` field of the yaml file.
## Specification
    ---
    name: luna-saga
    version: 3.0.1
    description: a saga middleware for luna <= if doesn't exist fall back on GitHub.
    keywords: ["Redux", "Store", "RxJS"]
    homepage: https://github.com/escherpad/luna-saga#readme
    repository:
      type: git
      url: git+https://github.com/escherpad/luna-saga.git
    bugs:
      url: https://github.com/escherpad/luna-saga/issues 
    scripts:
      # this is a default script, does not show up on the API view unless 
      # user click on this.
      postinstall: 
        args: // none in this case.
        script: bash -c "source gym && pip install -r requirements.txt"
        description: The full markdown discription of this script/endpoint
      test: ./test.py // example of no argument, no description.
      build: 
      train:
        # useful for OpenAI gym models.
        env:
          DISPLAY: ":1.0"
        args:
          # this can be flexible. We can specify a few as default.
          "--data": {"type": "s3", "s3": "2343134.aws.amazon.com/s3/blah-blah-blah-bucket"}
          "--dropout": false
          "--batchnorm": true
        script: ./train.py
      # just a plain O'script.
      generate: ./generate.py 
    author: Ge Yang <yangge1987@gmail.com>
    license: MIT
    requirements:
      luna: "^1.2.0"
      rxjs: "^5.0.2"


## Prior Arts

here is how a project looks like on `npm`: For our spec look below.

    ---
    name: luna-saga
    version: 3.0.1
    description: a saga middleware for luna
    main: dist/index.js
    typings: dist/index.d.ts
    directories:
      example: example
      test: tests
    homepage: https://github.com/escherpad/luna-saga#readme
    keywords:
    - Redux
    - Store
    - RxJS
    - saga
    - redux-saga
    - rxjs-redux-saga
    - Angular2
    - ng2
    - TypeScript
    - ts
    repository:
      type: git
      url: git+https://github.com/escherpad/luna-saga.git
    bugs:
      url: https://github.com/escherpad/luna-saga/issues
    scripts:
      postinstall: npm prune && typings install
      test: karma start
      clean: rimraf dist
      build:src: tsc src/index.ts --target es5 --lib  DOM,ES5,ScriptHost,ES2015.Generator,ES2015.Iterable,ES2015.Promise
        --outDir dist/ --module commonjs --moduleResolution node
      clean+build: npm run clean && npm run build:src
      publish:patch: npm run clean+build && git add . && git commit -m 'BUILD' && git
        push && npm version patch && npm publish
      publish:minor: npm run clean+build && git add . && git commit -m 'BUILD' && git
        push && npm version minor && npm publish
      publish:major: npm run clean+build && git add . && git commit -m 'BUILD' && git
        push && npm version major && npm publish
    author: Ge Yang <yangge1987@gmail.com>
    license: MIT
    dependencies:
      lodash.isplainobject: "^4.0.6"
      luna: "^1.3.1"
      setimmediate: "^1.0.4"
    peerDependencies:
      luna: "^1.2.0"
      rxjs: "^5.0.2"
    devDependencies:
      awesome-typescript-loader: "^3.0.0-beta.17"
      browserify: "^12.0.1"
      es6-shim: "^0.35.0"
      jasmine-core: "^2.4.1"
      karma: "^1.3.0"
      karma-chrome-launcher: "^2.0.0"
      karma-firefox-launcher: "^1.0.0"
      karma-jasmine: "^1.1.0"
      karma-safari-launcher: "^1.0.0"
      karma-sourcemap-loader: "^0.3.6"
      karma-webpack: "^1.7.0"
      luna: "^1.4.0"
      rimraf: "^2.4.4"
      sourcemap: "^0.1.0"
      ts-loader: "^1.3.3"
      tsify: "^0.13.1"
      typescript: "^2.2.0-dev.20161224"
      typings: "^2.0.0"
      webpack: "^1.12.14"

