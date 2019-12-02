/*jshint esversion: 9 */ 

const mongoose = require('mongoose');
//Look for .env configuration file to use environmental variables
require('dotenv').config();
//The URI to connect to a mongodb database is in the environment variable URI
const uri = process.env.URI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
}).then(() => {
  console.log('connected to database');
}).catch(() => {
  console.log('failed to connect to database');
});
