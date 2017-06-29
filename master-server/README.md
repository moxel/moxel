# Master Server

Master server configures Kubernetes cluster and manages models.

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