trap "sudo nginx -s stop" SIGINT
sudo nginx -s stop
cp ../utils/nginx/dummy-local /usr/local/etc/nginx/nginx.conf 
sudo nginx
# ./node_modules/.bin/serve -s build -p 3000 || true
PORT=3001 ./node_modules/.bin/babel-watch server/index.js
