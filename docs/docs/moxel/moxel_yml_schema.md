### moxel.yml schema:
```
name: alphanumeric string (eg. "image_colorization")
title: string (eg. "Image Colorization")
tag: version number (eg. "0.0.1")
description: string (eg. "An image colorization model based on caffe")
image: string. Must be one of the supported images (see below).
work_path: path to set as current working directory before starting (eg. ".")
assets: path to assets to load eg. 
- ./models/colorization_deploy_v2.prototxt
- ./models/colorization_release_v2.caffemodel
resources: resources for each container, eg. 
 memory: 512Mi
 cpu: "1"
labels: list of text labels eg. ["caffe", "computer vision"]
input_space:
  [ variable name: Moxel type ]* , eg.
  img_in: image.base64
output_space: 
  [ variable name: Moxel type ]* , eg. 
  img_out: image.base64
cmd: bash commands to run before the server starts to configure the environment
```
