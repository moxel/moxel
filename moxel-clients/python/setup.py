import os
from setuptools import setup

def read(fname):
    with open(os.path.join(os.path.dirname(__file__), fname)) as f:
        return f.read().strip()


setup(name='moxel',
      version='0.0.1',
      author='Moxel team',
      author_email='support@moxel.ai',
      url='http://moxel.ai',
      description="Share and discover the world's best models, built by the community.",
      long_description=read('README.rst'),
      keywords=['Machine Learning', 'Model', 'Deep Learning', 'Platform'],
      license='GPLv3',
      packages=['moxel'],
      entry_points={
        'console_scripts': []
      },
      classifiers=[
          "Development Status :: 2 - Pre-Alpha",
          "Topic :: Scientific/Engineering :: Artificial Intelligence",
          "Environment :: Console",
          "Programming Language :: Python :: 3"
      ],
      install_requires=read('requirements.txt').splitlines(),
      include_package_data=True,
      zip_safe=False
)
