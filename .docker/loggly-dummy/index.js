const http = require('http');

let server = http.createServer((request, response) => {
  console.log(`HTTP${request.httpVersion} ${request.method} ${request.url}`);

  response.end();
});
let stop   = () => {
  server.close(() => process.exit(0));
};

server.listen(80, () => {
  console.log('Started listening for incoming requests');

  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
});
