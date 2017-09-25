#!/usr/bin/env python
with open('VERSION', 'r') as f:
    version = f.read()

version = version.replace('\n', '')

numbers = version.split('.')

numbers[3] = 'post{}'.format(int(numbers[3].replace('post', '')) + 1)

with open('VERSION', 'w') as f:
    f.write('.'.join(numbers))
