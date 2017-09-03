FROM node:boron

COPY package.json /app/package.json
WORKDIR /app

COPY build /app/build
RUN npm install -g babel-cli

CMD PORT=3000 babel-node server/index.js
