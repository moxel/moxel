FROM bvlc/caffe:cpu

MAINTAINER Tim Shi <tianlins@cs.stanford.edu>

RUN pip install pexpect pyyaml flask numpy

# Install moxel drivers.
ARG DATE=$DATE
RUN pip install flask setuptools \
  && pip install -U moxel-python-driver moxel-http-driver moxel
