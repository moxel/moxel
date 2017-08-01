FROM golang

COPY ./secrets-prod /app/secrets-prod
COPY ./secrets-dev /app/secrets-dev

COPY ./bin/master-server /app/master-server

WORKDIR /app

ENTRYPOINT ["/app/master-server"]



