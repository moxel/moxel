# Image Colorization in Caffe

![](https://camo.githubusercontent.com/0f54d76e1561911ef2c423251c386a9368551365/687474703a2f2f726963687a68616e672e6769746875622e696f2f636f6c6f72697a6174696f6e2f7265736f75726365732f696d616765732f746561736572342e6a7067)

Automatic colorization using deep neural networks. "Colorful Image Colorization." In ECCV, 2016. [http://richzhang.github.io/colorization/](http://richzhang.github.io/colorization/).

## Overview

The first step is to make sure you've logged in. Try listing your models:

```
moxel list
```

If you haven't logged in yet, run the following command and you would be redirected to the login portal in browser.

```
moxel login
```

Similar to Github, Moxel hosts model in *repos*. A model repo is uniquely identified as `<userName>/<modelName>`. A model can have multiple versions, just like git version controls code. We assign a tag to the model, and label it as 

```
<userName>/<modelName>:<tag>
```

## Create a Model Repo

Just like Github, you can create a model repo on Moxel website. Go to [beta.dummy.ai/new](http://beta.dummy.ai/new)

<img src="new.png"/>

After filling out the model name and a one-line pitch, you will see the model page. It is easy to edit things like the model title, the description, README files, ... 

<img src="model.png"/>


## Deploy the Model

**Step 1**. 

Create a flask server that serves the following prediction procedure.

```
app = Flask(__name__)

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'OK'
    })


@app.route('/', methods=['POST'])
def detect():
    data = request.json

    image_binary = base64.b64decode(data['img_in'])

    image_f = BytesIO()
    image_f.write(image_binary)
    image_f.seek(0)

    image = Image.open(image_f)
    image_np = load_image_into_numpy_array(image)

    img_out = model.predict(image_np)['img_out']
    vis_file = BytesIO()
    scipy.misc.imsave(vis_file, img_out, format='png')
    vis_file.seek(0)
    vis_binary = vis_file.read()

    return jsonify({
        'img_out': base64.b64encode(vis_binary).decode('utf-8'),
    })

if __name__ == '__main__':
    app.run(debug=False, port=5900, host='0.0.0.0')
```

**Step 2**.

Write down `moxel.yml`

```
image: dummyai/py3-caffe-cpu
assets:
- ./models/colorization_deploy_v2.prototxt
- ./models/colorization_release_v2.caffemodel
- ./resources/pts_in_hull.npy
resources:
  memory: 512Mi
  cpu: "1"
input_space:
  img_in: Image
output_space:
  img_out: Image
cmd:
- pip install -r requirements.txt
- python serve_model.py
```

**Step 3**. 

Push the model to Moxel, and have it deployed.

```
moxel push -f moxel.yml colorization:latest
```

By default, the tag `latest` is added when the model repo is created. You may also push to other versions, such as `0.0.1`. Moxel allows you to switch to different versions easily.



