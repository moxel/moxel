# Master Server

Master server configures Kubernetes cluster and manages models.

## Code Version Control

Master server uses Git to control the versions of model codebase. A NFS is setup to host the code, and shared across all containers.

### Pushing the Code

The client `warp` 

1. Set remote to the master server.
2. Create Git repo on NFS if it does not exist.
3. Push code to the Git repo through SSH.

### Accessing the Code

It defines a constant `GitRoot = /mnt/nfs/code`. The Git repo is stored under `<GitRoot>/<user>/<repo>/repo`. 

When using a branch of the repo for training / deployment, the master server first uses Git-Worktree to create a mirror under 

```
<GitRoot>/<user>/<repo>/mirror/<commit>
```



## Development

### Run the Server

```
make build && make run ENV=dev
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
make test ARGS=github.com/dummy-ai/mvp/master-server/models
```

To run testing on a specific function, do

```
make test ARGS="github.com/dummy-ai/mvp/master-server -run TestGetRepoURL"

make test ARGS="github.com/dummy-ai/mvp/master-server/models -run TestAddModel"
```


#### Test Deployments

Make sure kubeconfig `admin.conf` is available in this directory.

## Production


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