If you are using `kubectl` with custom `kubeconfig` file, make sure first create an alias

```
alias kubectl="/usr/local/bin/kubectl --kubeconfig=/Users/tims/.kube/admin.conf"
```

### Minimum Tutorial to Get Started

[https://github.com/kubernetes/ingress/tree/master/examples/deployment/nginx](https://github.com/kubernetes/ingress/tree/master/examples/deployment/nginx)

The ingress controller relies on `kubeconfig` file to config the Kube cluster. The `Makefile` would create configmap that includes `admin.conf`. Make sure the IP address in `admin.conf` is a private IP address. Joining with a public IP address will cause permssion error like 

```
User "system:anonymous" cannot proxy services in the namespace "default"
```

### Expose NodePort

With a custom deployment of Kubernetes, there is no integration with Google Cloud. 
