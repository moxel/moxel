from moxel.space.image import Image
import numpy as np


def test_from_file_jpg():
    image = Image.from_file('tests/lena.jpg')
    assert image.shape == (512, 512, 3)
    assert (image.rgb(0, 0) == [ 223., 136., 126.]).all()


def test_from_file_png():
    image = Image.from_file('tests/lena.png')
    assert image.shape == (512, 512, 3)
    assert (image.rgb(0, 0) == [ 226.,  137.,  125.]).all()

def test_to_numpy():
    image = Image.from_file('tests/lena.jpg')
    image_np = image.to_numpy()
    assert isinstance(image_np, np.ndarray)
    assert image_np.shape == (512, 512, 3)

def test_to_numpy_rgb():
    image = Image.from_file('tests/lena.jpg')
    image_np = image.to_numpy_rgb()
    assert isinstance(image_np, np.ndarray)
    assert image_np.shape == (512, 512, 3)
    assert image_np[0,0,0] == 223.
