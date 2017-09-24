FROM dummyai/python3

MAINTAINER Tim Shi <tianlins@cs.stanford.edu>

RUN apt-get update && apt-get install -y redis-server python3-numpy

RUN pip3 install redis dill

COPY .build/moxel-drivers /drivers
COPY .build/moxel-clients /clients

RUN pip install flask setuptools \
  && pip install -e /clients/python \
  && pip install -e /drivers/python \
  && pip install -e /drivers/http 


