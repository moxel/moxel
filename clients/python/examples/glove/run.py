from pprint import pprint

from moxel import Model
from moxel.space import String

model = Model('strin/glove.42B.300d:latest')
pprint(model.metadata)

word = String(100).from_str('either')
vec = model.predict({'word': word})['vec']

print('vec', vec.to_object())
