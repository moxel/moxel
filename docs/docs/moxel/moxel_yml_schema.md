### moxel.yml schema:

A Moxel YAML file looks like this: 

```
name: image_colorization
tag: 0.0.1 
image: py3-tf
assets: 
- ./models/colorization_deploy_v2.prototxt
- ./models/colorization_release_v2.caffemodel
resources:
 memory: 512Mi
 cpu: "1"
input_space:
  img_in: image.base64
output_space: 
  img_out: image.base64
main:
  type: python
    entrypoint: serve.py::get_answer
```

It provides some specs about the model:

* **name**: the repo name for the model.
* **tag**: version of the model.
* **image**: the docker image to serve the model in. Must be one of the [supported images](supported_images).
* **assets**: paths to large assets that will be linked in the Docker container. These will be uploaded by the Moxel CLI even if they are not tracked in Git.
* **resources**: basic computing resource requirements for the model. If not specified, it will request 1 CPU and 1 GB of memory.
* **input_space**: the variable names and their types for model input. Must be one of the [supported types](io_types).
* **output_space**: the variable names and their types for model output. Must be one of the [supported types](io_types)
* **main**: the entrypoint to the model. For python deployment, specify the name of a function. At the moment only Python deployment is supported.




