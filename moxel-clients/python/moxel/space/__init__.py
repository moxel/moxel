from .image import Image
from .string import String
from .json import JSON
from .array import Array


def get_space(name):
    ''' Convert space repr to actual class.
    '''
    if name == 'Image':
        return Image
    elif name == 'String':
        return String
    elif name == 'JSON':
        return JSON
    elif name == 'Array':
        return Array

