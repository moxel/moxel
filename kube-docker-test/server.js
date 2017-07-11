const http = require('http');

const handleRequest = function (request, response) {
    console.log('Received request for URL: ' + request.url);
    response.writeHead(200);
    response.end('Hello World! -- V2!');
};
const www = http.createServer(handleRequest);
www.listen(8080);