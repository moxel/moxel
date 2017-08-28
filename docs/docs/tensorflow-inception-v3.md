# Image Colorization in Caffe

![](https://camo.githubusercontent.com/0f54d76e1561911ef2c423251c386a9368551365/687474703a2f2f726963687a68616e672e6769746875622e696f2f636f6c6f72697a6174696f6e2f7265736f75726365732f696d616765732f746561736572342e6a7067)

Automatic colorization using deep neural networks. "Colorful Image Colorization." In ECCV, 2016. [http://richzhang.github.io/colorization/](http://richzhang.github.io/colorization/).


## Deploy the Model

**Step 1**. 

Create a flask server that serves the following prediction procedure.

```
@app.route('/', methods=['POST'])
def detect():
    data = request.json

    image_binary = base64.b64decode(data['img_in'])

    image_f = BytesIO()
    image_f.write(image_binary)
    image_f.seek(0)

    image = Image.open(image_f)
    image_np = load_image_into_numpy_array(image)

    img_out = m.predict(image_np)['img_out']
    vis_file = BytesIO()
    scipy.misc.imsave(vis_file, img_out, format='png')
    vis_file.seek(0)
    vis_binary = vis_file.read()

    return jsonify({
        'img_out': base64.b64encode(vis_binary).decode('utf-8'),
    })
```

**Step 2**.

Write down `dummy.yml`

```
name: colorization
title: Image Colorization
tag: 0.0.1
description: An image colorization model based on caffe
image: dummyai/py3-caffe-cpu
work_path: .
assets:
- ./models/colorization_deploy_v2.prototxt
- ./models/colorization_release_v2.caffemodel
- ./resources/pts_in_hull.npy
resources:
  memory: 512Mi
  cpu: "1"
labels: ["caffe", "computer vision"]
input_space:
  img_in: image.base64
output_space:
  img_out: image.base64
cmd:
- pip install -r requirements.txt
- python serve_model.py
```

**Step 3**. 

Deploy

```
warp create -f dummy.yaml
warp deploy colorization:0.0.1
```

