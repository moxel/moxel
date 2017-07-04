# Dummy.ai MVP

> World's Best Models, Built by the Community.

Dummy is a marketplace for machine learning models. Researchers deploy and publish models as "lambda function", paying a low cost of serving per request. Developers discover intereseting models and integrate them into applications through API.

## Objective Function

Our goal is to differentiate through the following competitve advantages:

1. **Low friction to start** Anyone can start uploading machine learning models in minutes.
2. **Low cost of serving** Models are served like lambda functions and incur cost only when the API is called.
3. **High bar for initial cohort of models**. The initial set of models on the platform will be of high quality.


## Architecture

![](docs/dummy-arch.png)

The dummy architecture is built to scale. We created microservice framework using open-source Kubernetes and Docker. Dummy is also designed to be "cloud-agnostic". 

With features like Kubernetes Federation, we can not only deploy the cluster to Google Cloud, AWS, Azure or private cloud, but also join these clouds to provide unified interface.


### Key Compoments


#### Web Server

`web-server` is a node.js server to provide static contents and flashy webpages.

#### Master Server

`master-server` is a performant server written in Go to control Kubernetes.

#### Ingress

The Ingress is an nginx controller to redirect traffic to model API endpoints.

### Candiate Names for Launch

- Monet
- Moxel
- Momart
