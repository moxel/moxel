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

        (im_width, im_height) = image.size
        im = np.array(image.getdata()).reshape(
            (im_height, im_width, 3)) / 255.

        return Image(im)

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


    def to_numpy(self):
        return self.im

    def to_numpy_rgb(self):
        return self.im * 255

    def to_PIL(self):
        from PIL import Image as PILImage
        return PILImage.fromarray(np.array(self.im * 255, dtype='uint8'))

    def to_base64(self):
        """ Return png of the image in base64 encoding.
        """
        image_pil = self.to_PIL()
        buf = BytesIO()
        image_pil.save(buf, 'png')
        buf.seek(0)
        return base64.b64encode(buf.read()).decode('utf_8')





