FROM dummyai/python3

MAINTAINER Tim Shi <tianlins@cs.stanford.edu>

RUN apt-get update && apt-get install -y redis-server python3-numpy

RUN pip3 install redis dill

COPY core /core

ENTRYPOINT ["/core/init"]
