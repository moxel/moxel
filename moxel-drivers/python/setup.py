from setuptools import setup

with open('VERSION', 'r') as f:
    version = f.read()
    version = version.replace('\n', '')

setup(name='moxel-python-driver',
      version=version,
      description='python driver for moxel models',
      # url='www.moxel.ai',
      author='moxel',
      author_email='support@moxel.ai',
      license='MIT',
      zip_safe=False,
      packages=['moxel_python_driver'],
      entry_points={
          "console_scripts": [
              "moxel-python-driver = moxel_python_driver.driver:main",
          ]
      }
)
