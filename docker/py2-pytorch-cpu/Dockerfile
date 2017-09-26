FROM moxel/conda2

MAINTAINER Jim Fan <jimfan@cs.stanford.edu>

RUN conda install -y pytorch torchvision -c soumith

# Add drivers.
COPY .build/moxel-drivers /drivers
COPY .build/moxel-clients /clients

RUN pip install flask setuptools \
  && pip install -e /clients/python \
  && pip install -e /drivers/python \
  && pip install -e /drivers/http 

