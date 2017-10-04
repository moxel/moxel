FROM bvlc/caffe:cpu

MAINTAINER Tim Shi <tianlins@cs.stanford.edu>

RUN mkdir -p /mnt/cloudfs

RUN pip install pexpect pyyaml flask numpy

COPY .build/moxel-drivers /drivers
COPY .build/moxel-clients /clients

# Install moxel drivers.
ARG DATE=$DATE
RUN pip install flask setuptools \
  && pip install -U moxel-python-driver moxel-http-driver moxel
