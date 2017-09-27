import numpy as np
import torch
import os

t = torch.FloatTensor([7,8,9])
print('CPU:', t)

t = t.cuda()
print('GPU:', t)
