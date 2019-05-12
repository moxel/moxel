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

To create the credentials for `dev` environment, make sure you've switched to `dev` already by 

```
use-moxel-dev
```

First, set up the environment variables, such as 


```

export AUTH0_CLIENT_ID="xxx"
export AUTH0_CLIENT_SECRET="xxx"

```

At Moxel, we have a shared doc to keep track of common secrets. Ask admin for that.

To deploy the secrets to kube cluster, 

```
make dev
```

Similarly, to deploy secrets to the production kube cluster, do the above except run 

```
make prod
```


