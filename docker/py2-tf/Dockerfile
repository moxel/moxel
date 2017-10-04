FROM moxel/python2

MAINTAINER Moxel <support@moxel.ai>

RUN pip install --upgrade tensorflow==1.0

RUN apt update \
    && apt install -y sox libsox-fmt-all protobuf-compiler python-pil python-lxml tmux htop
    
# Dependencies for NLP.
RUN pip install flask nltk tqdm jinja2 \
    && python -c "import nltk; nltk.download('punkt')"

# dependencies for DeepSpeech
RUN apt install -y libssl-dev

RUN pip install --upgrade pip \
    && pip install librosa>=0.5 scipy numpy pyxdg python_speech_features sox pandas \
    && pip install https://github.com/kpu/kenlm/archive/master.zip paramiko pysftp bs4 jupyter matplotlib Pillow


# Install moxel drivers.
ARG DATE=$DATE
RUN pip install flask setuptools \
  && pip install -U moxel-python-driver moxel-http-driver moxel

