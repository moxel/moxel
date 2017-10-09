from moxel.space import Image, Array, JSON

import numpy as np
import base64
import six
import simplejson


SPACE_MAP = {
    'image': Image,
    'str': str,
    'json': JSON,
    'array': Array,
    'float': float,
    'float32': np.float32,
    'float64': np.float64,
    'int': int,
    'bool': bool,
}


def get_space(name):
    ''' Convert space repr to actual class.
    '''
    if six.PY2 and type(name) == unicode:
        name = str(name)

    if type(name) == str:
        assert name in SPACE_MAP, 'Cannot get unknown space {}'.format(name)
        return SPACE_MAP[name]
    elif type(name) == dict:
        return {
            k: get_space(v) for k, v in name.items()
        }
    else:
        raise Exception('Only str and dict are supported in get_space. Not ' + str(type(name)))


def format_json(obj):
    ''' Try convert obj into JSON serializable format.
    '''
    if isinstance(obj, dict):
        return {k: format_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [format_json(v) for v in obj]
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    else:
        return simplejson.loads(simplejson.dumps(obj))

def encode_json(kwargs, spaces):
    ''' Encode a dictionary of moxel variables into JSON.
        Used for HTTP transimission.

        Return: A JSON-serializable dictionary.
    '''
    assert kwargs, 'Cannot encode empty input/output {}'.format(spaces)
    assert isinstance(kwargs, dict), 'input/output to encode must be a dict'
    input_dict = {}
    for var_name, var_space in spaces.items():
        assert var_name in kwargs, 'Requires argument {}'.format(var_name)

        def check_type():
            assert type(kwargs[var_name]) == var_space, \
                ('Variable type {}:{} does not match spec {}:{}.'
                .format(var_name, type(kwargs[var_name]), var_name, var_space))

        obj = kwargs[var_name]
        # TODO: be able to nest types in dict and list.
        if var_space == Image:
            # Assume base64 encoding.
            encoded = obj.to_base64()
        elif var_space in [str, float, int, bool]:
            encoded = var_space(obj)
        elif var_space in [np.float32, np.float64]:
            encoded = base64.b64encode(obj.tostring())
        elif var_space == JSON:
            encoded = format_json(obj)
        elif var_space == Array:
            if isinstance(obj, np.ndarray):
                obj = obj.tolist()
            elif isinstance(obj, list) or isinstance(obj, dict):
                obj = format_json(obj)
            else:
                obj = obj.to_list()
            encoded = simplejson.dumps(obj)
        else:
            raise Exception('Not implemented input space: ' + repr(var_space))

        input_dict[var_name] = encoded

    return input_dict


def decode_json(results, spaces):
    assert results, 'Cannot decode empty input/output {}'.format(spaces)
    assert isinstance(results, dict), 'input/output to decode must be a dict'

    output_dict = {}

    for var_name, var_space in spaces.items():
        assert var_name in results, 'Requires argument {}'.format(var_name)

        encoded = results[var_name]

        if var_space == Image:
            obj = var_space.from_base64(encoded)
        elif var_space in [str, float, int, bool]:
            obj = var_space(encoded)
        elif var_space in [np.float32, np.float64]:
            obj = np.fromstring(base64.b64decode(encoded), dtype=var_space)[0]
        elif var_space == JSON:
            obj = var_space.from_object(encoded)
        elif var_space == Array:
            obj = var_space.from_list(simplejson.loads(encoded))
        else:
            raise Exception('Not implemented output space: ' + str(var_space))

        output_dict[var_name] = obj

    return output_dict



def parse_space_dict(space_dict):
    new_space_dict = {}

    for k, v in space_dict.items():
        new_space_dict[k] = get_space(v)

    return new_space_dict

