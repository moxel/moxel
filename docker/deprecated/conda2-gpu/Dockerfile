FROM nvidia/cuda:8.0-cudnn5-devel

MAINTAINER Jim Fan <jimfan@cs.stanford.edu>

# ====== Anaconda2.7: https://github.com/ContinuumIO/docker-images/blob/master/anaconda/Dockerfile
ENV LANG=C.UTF-8 LC_ALL=C.UTF-8

RUN apt-get update --fix-missing && apt-get install -y wget bzip2 ca-certificates \
    libglib2.0-0 libxext6 libsm6 libxrender1 \
    git mercurial subversion

RUN echo 'export PATH=/opt/conda/bin:$PATH' > /etc/profile.d/conda.sh && \
    wget --quiet https://repo.continuum.io/archive/Anaconda2-4.4.0-Linux-x86_64.sh -O ~/anaconda.sh && \
    /bin/bash ~/anaconda.sh -b -p /opt/conda && \
    rm ~/anaconda.sh

RUN apt-get install -y curl grep sed dpkg && \
    TINI_VERSION=`curl https://github.com/krallin/tini/releases/latest | grep -o "/v.*\"" | sed 's:^..\(.*\).$:\1:'` && \
    curl -L "https://github.com/krallin/tini/releases/download/v${TINI_VERSION}/tini_${TINI_VERSION}.deb" > tini.deb && \
    dpkg -i tini.deb && \
    rm tini.deb && \
    apt-get clean

ENV PATH /opt/conda/bin:$PATH

# ================== end Anaconda ==================

RUN apt update \
    && apt-get install -y tree git wget build-essential curl \
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

RUN conda install pexpect pyyaml

COPY core /core

ENTRYPOINT ["/core/init"]
