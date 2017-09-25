from setuptools import setup

setup(name='moxel-http-driver',
      version='0.0.1',
      description='generic http driver for moxel models',
      url='http://moxel.ai',
      author='moxel',
      author_email='support@moxel.ai',
      license='MIT',
      zip_safe=False,
      packages=['moxel_http_driver'],
      entry_points={
          "console_scripts": [
              "moxel-http-driver = moxel_http_driver.driver:main",
          ]
      }
)
