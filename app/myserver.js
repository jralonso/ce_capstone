// /* global require */
// 'use strict';

// const express = require('express');

// // Constants
// const PORT = 5000;
// const HOST = '0.0.0.0';

// // App
// const app = express();
// app.get('/', (req, res) => {
//   res.send('<html><body><h1>Hello ' + req.query.name + ' </h1> | Pod: ' + process.env.HOSTNAME);
// });

// //app.get('/server', (req, res) => {
// //  res.send(`Running on http://${HOST}:${PORT}`);
// //});

// app.listen(PORT, HOST);
// console.log(`Running on http://${HOST}:${PORT}`);

var http = require('http');
var requests=0;
var podname= process.env.HOSTNAME;
var startTime;
var host;
var handleRequest = function(request, response) {
  response.setHeader('Content-Type', 'text/plain');
  response.writeHead(200);
  response.write("Hello Kubernetes bootcamp! | Hostname: ");
  response.write(host);
  response.end(" | v=1\n");
  console.log("Hostname:" ,host, "| Total Requests:", ++requests,"| App Uptime:", (new Date() - startTime)/1000 , "seconds", "| Log Time:",new Date());
}
var www = http.createServer(handleRequest);
www.listen(8080,function () {
    startTime = new Date();;
    host = process.env.HOSTNAME;
    console.log ("Kubernetes Bootcamp App Started At:",startTime, "| Running On: " ,host, "\n" );
});