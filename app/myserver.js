/* global require */
'use strict';
var os = require("os");
var hostname = os.hostname();
const express = require('express');

// Constants
const PORT = 5000;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  var response = '<html><body><h1 style="color:green">Hello ' 
  response += req.query.name 
  response += '</h1>' 
  response += '<p><h2>From Green testing environment: '
  response += hostname
  response += '</h2></p>'
  res.send(response);
});

//app.get('/server', (req, res) => {
//  res.send(`Running on http://${HOST}:${PORT}`);
//});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
