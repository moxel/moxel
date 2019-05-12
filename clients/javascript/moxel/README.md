To use babel to build the package,

```
make build
```

It also uses `browserify` to generate browser-compatible Javscript library.

# Testing

To start testing, first install [Mocha](https://codeburst.io/how-to-test-javascript-with-mocha-the-basics-80132324752e).

## Node.js tests.

```
make test
```

This will run the `mocha` command and use tests in `test/*.js`.

## Browser tests.

To test Moxel clients runs correctly, simply open `test.html` in `test-browser/`. 

This will invoke `mocha` in browser and run the tests with Moxel client.


# Release

Run 

```
make release
```

which will release the Javascript library to Cloud Storage.