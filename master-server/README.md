# Master Server

Master server configures Kubernetes cluster and manages models.

## Useful Kube Commands

```
kubectl expose deploy default-http-backend  --name=default-http --type="LoadBalancer"
```

```
kubectl expose deploy tf-object-detection --type=NodePort --name=tf-object-detection
```

Kube Proxy / Dashboard

```
kubectl proxy
```

Then go to `http://127.0.0.1:8001/ui`.