FROM moxel/python3

MAINTAINER Moxel <support@moxel.ai>

RUN pip3 install http://download.pytorch.org/whl/cu75/torch-0.2.0.post3-cp35-cp35m-manylinux1_x86_64.whl \
 && pip3 install torchvision

# Install moxel drivers.
ARG DATE=$DATE
RUN pip install flask setuptools \
  && pip install -U moxel-python-driver moxel-http-driver moxel

