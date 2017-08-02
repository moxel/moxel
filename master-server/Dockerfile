FROM golang

# Install Git.
RUN wget https://github.com/git/git/archive/v2.10.0.tar.gz \
  && tar xzvf v2.10.0.tar.gz \
  && cd git-2.10.0/ \
  && apt update \
  && apt install -y autoconf zlib1g-dev gettext asciidoc xsltproc xmlto \
  && make configure \
  && ./configure \
  && make all \
  && make install 

RUN cp /usr/local/bin/git /usr/bin/git

COPY ./secrets-prod /app/secrets-prod
COPY ./secrets-dev /app/secrets-dev

COPY ./bin/master-server /app/master-server

WORKDIR /app

USER nobody:nogroup
ENTRYPOINT ["/app/master-server"]



