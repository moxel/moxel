FROM moxel/conda2

MAINTAINER Jim Fan <jimfan@cs.stanford.edu>

RUN conda install pytorch torchvision -c soumith

COPY core /core
ENTRYPOINT ["/core/init"]
