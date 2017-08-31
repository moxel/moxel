trap "sudo nginx -s stop" SIGINT
sudo nginx -s stop
cp ../utils/nginx/dummy-local /usr/local/etc/nginx/nginx.conf 
sudo nginx
./node_modules/.bin/serve -s build -p 3001 || true
