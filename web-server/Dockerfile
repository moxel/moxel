FROM node:boron

COPY package.json /app/package.json
WORKDIR /app

COPY build /app/build
COPY server /app/server

# Install server dependencies
RUN cd server && \
  npm install -g babel-cli && \
  npm install --save babel-preset-es2015 express compression body-parser morgan isomorphic-fetch

CMD PORT=3000 babel-node --presets es2015 server/index.js
