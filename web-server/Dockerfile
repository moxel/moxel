FROM node:boron

COPY package.json /app/package.json

WORKDIR /app

RUN npm uninstall babel-cli \
  && npm install -g babel-cli

COPY . /app

RUN npm run build:src \
  && npm run build:server 

CMD npm run start:production
