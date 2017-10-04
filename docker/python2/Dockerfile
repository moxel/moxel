FROM ubuntu:16.04

MAINTAINER Tim Shi <tianlins@cs.stanford.edu>

RUN apt update \
    && apt-get install -y python python-dev tree python-pip git wget build-essential curl 

RUN pip install pexpect pyyaml flask numpy

# Install moxel drivers.
ARG DATE=$DATE
RUN pip install flask setuptools \
  && pip install -U moxel-python-driver moxel-http-driver moxel
