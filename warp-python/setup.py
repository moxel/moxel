from setuptools import setup

setup(name='warp',
      version='0.0.1',
      description='minimalistic deep learning experiment framework',
      url='www.dummy.ai',
      author='timshi',
      author_email='tim@dummy.ai',
      license='MIT',
      zip_safe=False,
      packages=['warpcli'],
      entry_points={
          "console_scripts": [
              "warpy = warpcli.cli:cli",
          ]
      }
)
