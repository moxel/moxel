FROM ubuntu:16.04

MAINTAINER Tim Shi <tianlins@cs.stanford.edu>

RUN apt update \
    && apt-get install -y python3 python3-dev tree python3-pip git wget build-essential curl \
    && wget https://github.com/libfuse/libfuse/releases/download/fuse-3.0.1/fuse-3.0.1.tar.gz -O /tmp/fuse.tar.gz \
    && (cd /tmp && tar -xvf /tmp/fuse.tar.gz) 

# Git lfs
RUN curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash \
    && apt-get install git-lfs \
    && git lfs install

# AWS S3 File System
RUN (cd /tmp/fuse-3.0.1 && ./configure --prefix=/usr/local && make -j4 && make install && cp /usr/local/bin/fusermount3 /usr/bin/fusermount) \
    && (wget https://github.com/kahing/goofys/releases/download/v0.0.10/goofys -O /usr/bin/goofys && chmod +x /usr/bin/goofys) 

# Google Cloud File System
RUN echo "deb http://packages.cloud.google.com/apt gcsfuse-jessie main" | tee /etc/apt/sources.list.d/gcsfuse.list; \
  curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add - && \
  apt-get update ; apt-get install -y apt-utils kmod && apt-get install -y gcsfuse 

RUN mkdir -p /mnt/cloudfs

RUN pip3 install pexpect pyyaml

COPY core /core

ENTRYPOINT ["/core/init"]
