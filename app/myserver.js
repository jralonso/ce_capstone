/* global require */
'use strict';

const express = require('express');

// Constants
const PORT = 5000;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  res.send('<html><body><h1>Hello ' + req.query.name + ' </h1>');
});

//app.get('/server', (req, res) => {
//  res.send(`Running on http://${HOST}:${PORT}`);
//});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
