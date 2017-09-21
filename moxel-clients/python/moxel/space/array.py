# N-dimentional array.
from .core import Space
import numpy as np

class Array(Space):
    ''' N-dimentional array. Use numpy array as internal representation.
    '''
    NAME='Array'

    def __init__(self, numpy_array):
        self.numpy_array = numpy_array

    @staticmethod
    def from_numpy(numpy_array):
        return Array(numpy_array)

    @staticmethod
    def from_list(arr):
        return Array.from_numpy(np.array(arr))

    def to_numpy(self):
        return self.numpy_array

    def to_list(self):
        ''' Return a nested list.
        '''
        def make_list(arr):
            if isinstance(arr, np.ndarray):
                return list(map(lambda x: make_list(x), arr))
            else:
                return float(arr)

        return make_list(self.numpy_array)



