const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.URI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
}).then(() => {
  console.log('connected to database');
}).catch(() => {
  console.log('failed to connect to database');
});
