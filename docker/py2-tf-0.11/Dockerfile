FROM ubuntu:16.04

MAINTAINER Tim Shi <tianlins@cs.stanford.edu>

RUN apt update \
    && apt-get install -y python python-dev tree python-pip git wget build-essential curl  \
    && pip install -U pip

RUN pip install pexpect pyyaml flask numpy matplotlib Pillow scipy pandas bs4 jupyter

RUN pip install tensorflow==0.12

# Install moxel drivers.
ARG DATE=$DATE
RUN pip install flask setuptools \
  && pip install -U moxel-python-driver moxel-http-driver moxel

