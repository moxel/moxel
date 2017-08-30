from .image import Image
from .string import String
from .json import JSON


def get_space(name):
    ''' Convert space repr to actual class.
    '''
    if name == 'Image':
        return Image
    elif name == 'String':
        return String(1000)
    elif name == 'JSON':
        return JSON

