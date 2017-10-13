# IO Types
                        
Moxel standardizes the input and output spaces of models. It provides a set of basic types, such as images and text. 

To use any of the Moxel Python classes in code, make sure you've installed Moxel and import from the moxel.space module:

```
from moxel.space.image import Image
from moxel.space.json import JSON
```

Detailed specs are below:

## String 

* **YAML schema name**: str 
* **Python type**: str

## Image

* **YAML schema name**: image

* **Python type**:
```
from .core import Space
import numpy as np
import base64
from six import BytesIO


class Image(Space):
    """ Logical semantic space for images.
    """
    NAME='Image'

    def __init__(self, im):
        self.im = im

    def resize(self, size, interp='bilinear', mode=None):
        import scipy.misc
        self.im = scipy.misc.imresize(self.im, size, interp, mode)

    @property
    def shape(self):
        return self.im.shape

    def rgb(self, i, j):
        return self.im[i, j, :] * 255

    @staticmethod
    def from_stream(f):
        # import only if the transformer is used.
        from PIL import Image as PILImage

        image = PILImage.open(f)
        return Image.from_PIL(image)

    @staticmethod
    def from_base64(data):
        import base64
        from six import BytesIO

        image_binary = base64.b64decode(data)

        image_f = BytesIO()
        image_f.write(image_binary)
        image_f.seek(0)

        return Image.from_stream(image_f)

    @staticmethod
    def from_file(filename):
        with open(filename, 'rb') as f:
            return Image.from_stream(f)

    @staticmethod
    def from_PIL(image):
        image_data = np.array(image.getdata())

        (im_width, im_height) = image.size
        im_channel = len(image.getbands())

        if im_channel == 1:
            im = image_data.reshape((im_height, im_width)) / 255.
        else:
            im = image_data.reshape((im_height, im_width, im_channel)) / 255.

        return Image(im)



    def to_numpy(self):
        return self.im

    def to_numpy_rgb(self):
        return self.im * 255

    def to_PIL(self):
        from PIL import Image as PILImage
        return PILImage.fromarray(np.array(self.im * 255, dtype='uint8'))

    def to_stream(self):
        """ Return a stream of the image
        """
        image_pil = self.to_PIL()
        buf = BytesIO()
        image_pil.save(buf, 'png')
        buf.seek(0)
        return buf

    def to_base64(self):
        """ Return png of the image in base64 encoding.
        """
        buf = self.to_stream()
        return base64.b64encode(buf.read()).decode('utf_8')

    def __repr__(self):
        return '<Moxel Image {}>'.format(self.shape)
```


## JSON
* **YAML schema name**: json

* **Python type:**
```
from .core import Space

import json


class JSON(Space):
    NAME = 'JSON'

    def __init__(self, data):
        self.data = data

    @staticmethod
    def from_object(json):
        assert isinstance(json, dict) or isinstance(json, list)
        return JSON(json)

    def to_str(self):
        return json.dumps(self.data)

    def to_bytes(self, encoding='utf_8'):
        return self.to_str().encode(encoding)

    def to_object(self):
        return self.data
```
