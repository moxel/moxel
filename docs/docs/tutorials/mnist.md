![](https://camo.githubusercontent.com/d440ac2eee1cb3ea33340a2c5f6f15a0878e9275/687474703a2f2f692e7974696d672e636f6d2f76692f3051493378675875422d512f687164656661756c742e6a7067)


# MNIST with TensorFlow

This tutorial shows how to wrap a basic MNIST model in Tensorflow and upload it to Moxel.

Live model: [http://beta.moxel.ai/models/strin/mnist/latest](http://beta.moxel.ai/models/strin/mnist/latest)

Source code: [https://github.com/moxel/tf-mnist](https://github.com/moxel/tf-mnist).

## Wrap Model in `serve.py`

Moxel will upload your git repository to cloud, together with large model files such as weights. You simply need to write a `serve.py` file, which may import your existing modules.

The `serve.py` file first initializes global resources, such as the MNIST predictor, and some global constants.

```
import os
import moxel.space

from MNISTTester import MNISTTester

mnist = MNISTTester(
            model_path='mnist/data/',
            data_path='/models/mnist-cnn')
```

Every time someone calls your model, Moxel would handle the request with your `predict` function. In the MNIST case, the predict function is,

```
def predict(img):
    img_bw = img.to_PIL().convert('L')
    img_bw = moxel.space.Image.from_PIL(img_bw)
    out = mnist.predict(img_bw.to_stream())
    return {'out': out}
```

The function takes an input `img` and produces one output `out`. Note that all `predict` functions must have a dict as output, with variable names being the keys.

## Write Model Spec File `moxel.yml`

Now, write a model spec file that tells Moxel how to serve the model. Start a `moxel.yml`:

```
name: mnist
tag: latest
image: py2-tf
assets:
- mnist/data
- models
resources:
  memory: 512Mi
  cpu: "1"
input_space:
  img: image
output_space:
  out: int
main:
  type: python
  entrypoint: serve.py::predict
```

In this example, we've specified the model should be run in `py2-tf` environment - Tensorflow 1.0 with Python 2. The input is `img` of type `image`, and the output is `out` of type int.

The `main` tells Moxel how to load the model. The entrypoint `serve.py::predict` says we should process request with the `predict` function in `serve.py`.


## Test Model Locally

Moxel allows you to test your model locally. This is as simple as 

```
moxel serve -f moxel.yml
```

This will start a HTTP server locally, listening at `localhost:5900`.

To use the API locally, try `test.py`

```
import moxel

model = moxel.Model('strin/mnist:latest', where='localhost')
image = moxel.space.Image.from_file('imgs/digit-2-rgb.png')
digit = model.predict(img=image)
print 'digit=', digit
```

Run `test.py` and see if the output is `2`.

## Push Model to Moxel

Just run 

```
moxel push
```

After a few seconds, your model would be live at Moxel, and you can play around the demo.





