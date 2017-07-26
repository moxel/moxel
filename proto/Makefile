dependency:
	go get -u github.com/grpc-ecosystem/grpc-gateway/protoc-gen-grpc-gateway && \
	go get -u github.com/grpc-ecosystem/grpc-gateway/protoc-gen-swagger && \
	go get -u github.com/golang/protobuf/protoc-gen-go

# generate grpc stubs
grpc:
	protoc -I/usr/local/include -I. \
	-I$$GOPATH/src \
	-I$$GOPATH/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis \
	--grpc-gateway_out=logtostderr=true:. \
	service.proto

# generate stub for proxy
proxy:
	protoc -I/usr/local/include -I. \
  -I$$GOPATH/src \
  -I$$GOPATH/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis \
  --grpc-gateway_out=logtostderr=true:. \
  service.proto
