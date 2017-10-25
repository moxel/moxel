# Moxel Secrets

Moxel runs on microservices. To share keys across all microservices, we use kubernetes secrets sharing:

[https://kubernetes.io/docs/concepts/configuration/secret/](https://kubernetes.io/docs/concepts/configuration/secret/)

This procedure only has to be done once for each kube cluster.

## Credentials

We use the following services

* Auth0
* SendGrid
* Postgres


## How 

User management and authentication.

Copy `credentials.template` to `auth0.json`, and put in the credentials by first encoding:

```
echo '<Credentials>' | base64
```

Then create the credentials by 

```
kubectl create -f credentials.yml
```



