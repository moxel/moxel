#!/usr/bin/env python
with open('moxel/VERSION', 'r') as f:
    version = f.read()

version = version.replace('\n', '')

numbers = version.split('.')

numbers[3] = 'post{}'.format(int(numbers[3].replace('post', '')) + 1)

with open('moxel/VERSION', 'w') as f:
    f.write('.'.join(numbers))
