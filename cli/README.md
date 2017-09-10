# Auth0 + Go Web App Sample

## Running the App

To run the app, make sure you have **go** and **goget** installed.

Rename the `.env.example` file to `.env` and provide your Auth0 credentials.

```bash
# .env

AUTH0_CLIENT_ID=84cuFhHnQOO9hqlXZdTl9F4vvXWa0Vgt
AUTH0_DOMAIN=dummyai.auth0.com
AUTH0_CLIENT_SECRET=_Ml_mDFwcwsMAONLIRfCRCKCJTKdlhC9OG0FzwirpRMTJ7LshG6ZoJ2AnRlT47_G
AUTH0_CALLBACK_URL=http://localhost:3000/callback
```

Once you've set your Auth0 credentials in the `.env` file, run `go get .` to install the Go dependencies.

Run `go run main.go server.go` to start the app and navigate to [http://localhost:3000/](http://localhost:3000/)

### Release

First change `VERSION` file to be the version to be released.

Then run

```
make release
```

The pipeline will returned a command such as 

```
curl -o warp https://beta.dummy.ai/release/cli/0.0.0-alpha/warp
```

### Testing

To run all test cases,

```
make build && make test
```

To run testing on just one function, for example `Func`, use 

```
make test ARGS="github.com/dummy-ai/mvp/moxel -run TestVerifyModelConfig"
```
