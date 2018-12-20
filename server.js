'use strict';

const express = require('express');
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

mongoose.connect('mongodb://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@' + process.env.DB_HOST + '/' + process.env.DB_NAME + '?authSource=admin' );

// App
const app = express();

//middleware
app.use(bodyParser.json())

//route definition
const routes = require("./routes");

app.use("/api/v1/auth", routes.auth);

app.get('/', (req, res) => {
  res.send('Hello world\n');
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
