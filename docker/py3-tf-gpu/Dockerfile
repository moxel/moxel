FROM dummyai/python3-gpu

MAINTAINER Tim Shi <tim@dummy.ai>

RUN pip3 install --upgrade tensorflow-gpu

RUN apt update \
    && apt install -y sox libsox-fmt-all protobuf-compiler python-pil python-lxml tmux htop
    
# dependencies for DeepSpeech
RUN apt install -y libssl-dev

RUN pip3 install librosa>=0.5 scipy numpy pyxdg python_speech_features sox pandas \
    && pip3 install https://github.com/kpu/kenlm/archive/master.zip paramiko pysftp bs4 jupyter matplotlib Pillow

COPY core /core

ENTRYPOINT ["/core/init"]
