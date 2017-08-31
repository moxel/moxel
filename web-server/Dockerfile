FROM node:boron

COPY package.json /app/package.json
WORKDIR /app

COPY build /app/build
RUN npm install -g serve

CMD serve -s build -p 3000
