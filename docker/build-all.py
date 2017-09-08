#!/usr/bin/env python
# Build and push all the docker images.
# The script will loop through sub-directories (1-level)
# and look for Makefile and Dockefile, if they both exists, then run `make build && make push`
import os
from os.path import join, exists, isdir

for directory in os.listdir('./'):
    if (isdir(directory) and exists(join(directory, 'Dockerfile'))
        and exists(join(directory, 'Makefile'))):
        print('[Building {}]'.format(directory))
        ret = os.system('cd {} && make build && make push'.format(directory))
        if ret != 0: break
