FROM dummyai/python3

MAINTAINER Tim Shi <tianlins@cs.stanford.edu>

RUN pip3 install --upgrade tensorflow

RUN apt update \
    && apt install -y sox libsox-fmt-all
    
# dependencies for DeepSpeech
RUN apt install -y libssl-dev

RUN pip3 install librosa>=0.5 scipy numpy pyxdg python_speech_features sox pandas \
    && pip3 install https://github.com/kpu/kenlm/archive/master.zip paramiko pysftp bs4

# create symlinks
RUN ln -s /usr/bin/python3 /usr/bin/python \
    && ln -s /usr/bin/pip3 /usr/bin/pip

COPY core /core

ENTRYPOINT ["/core/init"]
