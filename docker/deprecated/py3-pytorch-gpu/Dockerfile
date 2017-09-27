FROM moxel/conda3-gpu

MAINTAINER Jim Fan <jimfan@cs.stanford.edu>

RUN conda install pytorch torchvision cuda80 -c soumith

COPY core /core
ENTRYPOINT ["/core/init"]
