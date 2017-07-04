FROM node:boron

COPY web-server/package.json /app/web-server/package.json

WORKDIR /app/web-server

RUN npm install

COPY . /app

CMD npm start
