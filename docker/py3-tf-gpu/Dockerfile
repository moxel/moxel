FROM nvidia/cuda:8.0-cudnn5-devel

MAINTAINER Moxel <support@moxel.ai>

RUN apt-get update \
    && apt-get install -y python3 python3-dev tree python3-pip git wget build-essential curl sox libsox-fmt-all protobuf-compiler python-pil python-lxml tmux htop 

# create symlinks
RUN ln -fs /usr/bin/python3 /usr/bin/python \
    && ln -fs /usr/bin/pip3 /usr/bin/pip

# Install tensorflow
RUN pip install --upgrade tensorflow-gpu

# Dependencies for NLP.
RUN pip install flask nltk tqdm jinja2 \
    && python -c "import nltk; nltk.download('punkt')"
    
RUN pip install scipy numpy sox pandas bs4 jupyter matplotlib Pillow

# Install Basic python libraries
RUN pip install pexpect pyyaml flask numpy

ENV LD_LIBRARY_PATH /usr/local/nvidia/lib:/usr/local/nvidia/lib64

# Install moxel drivers.
ARG DATE=$DATE
RUN pip install flask setuptools \
  && pip install -U moxel-python-driver moxel-http-driver moxel



