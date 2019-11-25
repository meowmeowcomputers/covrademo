const express = require("express");
const app = express();
const parser = require("body-parser");
const routes = require("./app/routes")
require('./app/connection');
require('dotenv').config();

app.use( parser.json() );

app.use(routes)

app.listen(3050);
