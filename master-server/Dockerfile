FROM golang

COPY ./bin/master-server /app/master-server
COPY ./secrets-prod /app/secrets-prod
COPY ./secrets-dev /app/secrets-dev

WORKDIR /app

ENTRYPOINT ["/app/master-server"]



