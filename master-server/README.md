# Master Server

Master server configures Kubernetes cluster and manages models.

## Development

### Run the Server

```
make build && make run
```

### Migrate DB Schema

```
make build && make migrate
```

### Testing

To run all test cases,

```
make build && make test
```

To run testing on just one package, for example `models`, use 

```
make build && make test ARGS=github.com/dummy-ai/mvp/master-server/models
```

To run testing on a specific function, do

```
make build && make test ARGS="github.com/dummy-ai/mvp/master-server/models -run TestAddModel"
```



## Useful Kube Commands

```
kubectl expose deploy default-http-backend  --name=default-http --type="LoadBalancer"
```

```
kubectl expose deploy tf-object-detection --type=NodePort --name=tf-object-detection
```

Default backend
```
kubectl create -f https://raw.githubusercontent.com/kubernetes/contrib/master/ingress/controllers/nginx/examples/default-backend.yaml

kubectl expose rc default-http-backend --port=80 --target-port=8080 --name=default-http-backend
```

Create nginx config map

```
 kubectl create configmap nginx-template --from-file=nginx.tmpl=./nginx.tmpl
```

Kube Proxy / Dashboard

```
kubectl proxy
```

Then go to `http://127.0.0.1:8001/ui`.