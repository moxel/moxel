FROM node:boron

COPY package.json /app/package.json

WORKDIR /app

RUN npm uninstall babel-cli \
  && npm install -g babel-cli

COPY . /app
COPY node_modules/moxel-build /app/node_modules/moxel

RUN npm run build:src \
  && npm run build:server 

CMD npm run start:production
