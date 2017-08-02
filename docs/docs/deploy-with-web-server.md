# Model Deployment with Web Server

In this chapter, we will show how to deploy a machine learning model using Warpdrive.


## Tutorial: Tensorflow Object Detection


<p align="center">
  <img src="img/dogs_detections_output.jpg" width=676 height=450>
</p>
------------------------------------------------------------

### Deploy the Model

Deploying a Tensorflow model with `Warpdrive` is simple. Let's assume we already have a `predict(input)` function.

**Step 1**. Write a flask server to wrap the model predictor. 

```
@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'OK'
    })


@app.route('/', methods=['POST'])
def detect():
    data = request.json
    image_binary = base64.b64decode(data['image'])

    image_f = BytesIO()
    image_f.write(image_binary)
    image_f.seek(0)
    image = Image.open(image_f)
    
    return predict(image)
```

Make sure the server has two endpoints:

- `GET /`: a healthcheck used by NGinx to detect if the service is up.
- `POST /`: endpoint to serve the model.

As you can see, this step is quite standard, and should be automated in the future.

**Step 2**. Write a `dummy.yml` configuration file.

Our config for the object detection model looks like this 

```
user: dummy
name: tf-object-detection
repo: tf-object-detection
tag: latest
description: a tensorflow object detection model
image: dummyai/py3-tf-gpu
work_path: object_detection
assets:
- ssd_mobilenet_v1_coco_11_06_2017/frozen_inference_graph.pb
resources:
  memory: 512Mi
  cpu: "1"
  gpu: "1"
labels: ["tensorflow", "computer vision"]
cmd:
- cd ..
- protoc object_detection/protos/*.proto --python_out=.
- cd object_detection
- pip install flask
- python serve_model.py
```

Here, we are deploying the model with request for `512MB` memory, `1` CPU and `1` GPU. The assets list weight files used by the model. And there are a list of commands to set up the serving process.

**Step 3**. Use `warpdrive` to upload and deploy.

```
warp upload -f dummy.yml
```

First, `warpdrive` would create a commit automatically for your Git repository. This commit does not appear in your branch, so would be transparent. It is useful to reduce the network bandwidth required to sync code, and for version control purpose.

Then `warpdrive` will upload your assets to Cloud Storage.

Now, 

```
warp list
```

This shows a list of models and their states.

```
--------------------------------------------------------------------------------
   ID |                 Name |        Tag |     Status
      |  tf-object-detection |     latest |       INACTIVE
--------------------------------------------------------------------------------
```

As you can see, our model `tf-object-detection:latest` is uploaded but hasn't been running yet. To deploy it live, run

```
warp deploy tf-object-detection:latest
```

It would set up an Ingress endpoint at [http://kube-dev.dummy.ai:31900/model/dummy/tf-object-detection/latest](http://kube-dev.dummy.ai:31900/model/dummy/tf-object-detection/latest). Requests to this endpoint would be forwarded to our model service. 

### Testing the API

Now, we are ready to test the API. 

```
import requests
import base64
import os

URL = 'http://kube-dev.dummy.ai:31900/model/dummy/tf-object-detection/latest'

with open('test_images/image1.jpg', 'rb') as f:
    result = requests.post(URL, json={
        'image': base64.b64encode(f.read()).decode('utf-8'),
        'ext': 'jpg'
    }).json()
    print(result)

    image_binary = base64.b64decode(result['vis'])
    with open('output.png', 'wb') as f:
        f.write(image_binary)
    os.system('open output.png')
```

<p align="center">
<table style="font-size: 20px; text-align: center;">
<tr>
  <td >Input Image</td>
  <td>Output Bounding Boxes</td>
</tr>
<tr>
  <td><img src="img/dog-in.jpg" width=256 height=159></td>
  <td><img src="img/dog-out.png" width=256 height=159></td>
</tr>
</table>
</p>
