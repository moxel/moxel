# CLI

## Development

### Dependencies

* upx - binary compression [http://macappstore.org/upx/](http://macappstore.org/upx/)

## Release

First change `VERSION` file to be the version to be released.

Then run

```
make release
```

The pipeline will returned a command such as 

```
curl -o warp https://beta.dummy.ai/release/cli/0.0.0-alpha/warp
```

## Testing

To run all test cases,

```
make build && make test
```

To run testing on just one function, for example `Func`, use 

```
make test ARGS="github.com/dummy-ai/mvp/moxel -run TestVerifyModelConfig"
```
