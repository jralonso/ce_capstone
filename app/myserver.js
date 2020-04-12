/* global require */
'use strict';

const express = require('express');

// Constants
c  onst PORT = 5000;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  res.send('Hello ' + req.query.name);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
