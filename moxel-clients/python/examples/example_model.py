from pprint import pprint

from moxel import Model
from moxel.space import Image

model = Model('jimfan/colorization:0.0.1')
pprint(model.metadata)

img_in = Image.from_file('examples/ansel_adams3.jpg')
img_out = model.predict({'img_in': img_in})['img_out']

img_out.to_PIL().save('examples/colorization_out.png')
print(img_out)

