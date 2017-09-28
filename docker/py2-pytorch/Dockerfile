FROM continuumio/anaconda

MAINTAINER Moxel <support@moxel.ai>

RUN apt update \
    && apt-get install -y tree git wget build-essential curl 

RUN pip install http://download.pytorch.org/whl/cu75/torch-0.2.0.post3-cp27-cp27mu-manylinux1_x86_64.whl \
 && pip install torchvision  


# Install moxel drivers.
ARG DATE=$DATE
RUN pip install flask setuptools \
  && pip install -U moxel-python-driver moxel-http-driver moxel
