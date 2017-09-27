FROM continuumio/anaconda

MAINTAINER Moxel <support@moxel.ai>

RUN apt update \
    && apt-get install -y tree git wget build-essential curl 

RUN conda install pexpect pyyaml

# Install moxel drivers.
ARG DATE=$DATE
RUN pip install flask setuptools \
  && pip install -U moxel-python-driver moxel-http-driver moxel
