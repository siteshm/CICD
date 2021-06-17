'use strict';

const express = require('express');

// Constants
const PORT = process.env.PORT || 3000;

// App
const app = express();
app.get('/', function (req, res) {
  res.send('Hello world\n');
});
app.get('/health-check', function (req, res) {
  res.send('Health Check Passed\n');
});
app.get('/bad-health', function (req, res) {
  res.status(500).send('Health Check did not Passed\n');
});

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);
