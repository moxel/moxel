FROM nvidia/cuda:8.0-cudnn5-devel

MAINTAINER Moxel <support@moxel.ai>

RUN apt update \
    && apt-get install -y python3 python3-dev tree python3-pip git wget build-essential curl sox libsox-fmt-all protobuf-compiler python-pil python-lxml tmux htop 

RUN pip3 install pexpect pyyaml flask numpy

# Dependencies for NLP.
RUN pip install flask nltk tqdm jinja2 \
    && python -c "import nltk; nltk.download('punkt')"
    
# dependencies for DeepSpeech
RUN apt install -y libssl-dev

RUN pip3 install librosa>=0.5 scipy numpy pyxdg python_speech_features sox pandas \
    && pip3 install https://github.com/kpu/kenlm/archive/master.zip paramiko pysftp bs4 jupyter matplotlib Pillow

# create symlinks
RUN ln -fs /usr/bin/python3 /usr/bin/python \
    && ln -fs /usr/bin/pip3 /usr/bin/pip

# Install moxel drivers.
ARG DATE=$DATE
RUN pip install flask setuptools \
  && pip install -U moxel-python-driver moxel-http-driver moxel

