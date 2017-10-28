from __future__ import print_function
import os
import sys
import glob
from setuptools import setup, find_packages

def read(fname):
    with open(fname) as f:
        return f.read().strip()

def get_files(folder):
    return [f for f in glob.iglob(os.path.join(folder, '**'), recursive=True)
            if not os.path.isdir(f)]

if 0:
    _p = sys.platform
    if _p.startswith('linux'):
        bin_path = 'linux'
    elif _p == 'darwin':
        bin_path = 'osx'
    elif _p == 'win32':
        bin_path = 'windows'
    bin_path = os.path.join('moxel', 'bin', bin_path, 'moxel')

bin_paths = []
for name in ['linux', 'osx', 'windows']:
    bin_paths.append(os.path.join('moxel', 'bin', name, 'moxel'))

setup(name='moxel',
      version='0.0.3.post41',
      author='Moxel team',
      author_email='support@moxel.ai',
      url='http://moxel.ai',
      description="Share and discover the world's best models, built by the community.",
      long_description=read('README.rst'),
      keywords=['Machine Learning', 'Model', 'Deep Learning', 'Platform'],
      license='GPLv3',
      # https://stackoverflow.com/questions/29609141/why-doesnt-setuptools-copy-modules-in-a-subfolder
      packages=find_packages('.'),
      classifiers=[
          "Development Status :: 2 - Pre-Alpha",
          "Topic :: Scientific/Engineering :: Artificial Intelligence",
          "Environment :: Console",
          "Programming Language :: Python :: 3"
      ],
      install_requires=read('requirements.txt').splitlines(),
      include_package_data=True,
      # https://stackoverflow.com/questions/7522250/how-to-include-package-data-with-setuptools-distribute
      package_data={'moxel': bin_paths},
      # scripts=['bin/moxel'], # script has to be python file
      entry_points = {
          'console_scripts': ['moxel=moxel.bin.command_line:main'],
      },
      # data_files=[('.', ['bin/osx/moxel']), ('.', ['bin/linux/moxel']), ('.', ['bin/windows/moxel'])],
      zip_safe=False
)
