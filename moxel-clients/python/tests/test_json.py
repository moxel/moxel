import moxel
import numpy.random as npr

def test_encode_json():
    kwargs = {
        'result': [('a', 0.23), ('b', 0.99)]
    }
    encoded = moxel.space.utils.encode_json(kwargs, {
        'result': moxel.space.JSON
    })
    assert encoded['result'][0][0] == 'a'

def test_encode_numpy():
    kwargs = {
        'result': npr.randn(3,3)
    }
    encoded = moxel.space.utils.encode_json(kwargs, {
        'result': moxel.space.JSON
    })



