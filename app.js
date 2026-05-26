const express = require('express');
const app = express();
const routes = require('./src/routes/route.js');

app.use(express.json()); //middleware untuk ngambil, destructure si req.body;
app.use('/api/v1/todo', routes); //middleware routes, error tadi karena gak di pakein 'routes' di parameter kedua nya.

module.exports = app