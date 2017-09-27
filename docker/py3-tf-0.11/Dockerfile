FROM ubuntu:16.04

MAINTAINER Tim Shi <tianlins@cs.stanford.edu>

RUN apt update \
    && apt-get install -y python3 python3-dev tree python3-pip git wget build-essential curl 

RUN pip3 install pexpect pyyaml flask numpy matplotlib Pillow scipy pandas bs4 jupyter

RUN ln -fs /usr/bin/python3 /usr/bin/python \
    && ln -fs /usr/bin/pip3 /usr/bin/pip

RUN pip3 install tensorflow==0.12

# Install moxel drivers.
ARG DATE=$DATE
RUN pip install flask setuptools \
  && pip install -U moxel-python-driver moxel-http-driver moxel

