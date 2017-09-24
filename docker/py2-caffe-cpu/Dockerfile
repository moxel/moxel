FROM bvlc/caffe:cpu

MAINTAINER Tim Shi <tianlins@cs.stanford.edu>

RUN mkdir -p /mnt/cloudfs

RUN pip install pexpect pyyaml flask numpy

COPY .build/moxel-drivers /drivers
COPY .build/moxel-clients /clients

RUN pip install flask setuptools \
  && pip install -e /clients/python \
  && pip install -e /drivers/python \
  && pip install -e /drivers/http 

