const express = require("express");
const app = express();
const parser = require("body-parser");
const routes = require("./api/routes")
//Connect to mongodb database
require("./api/connection");
//Look for .env configuration file to use environmental variables
require("dotenv").config();

app.use( parser.json() );
app.use(routes)

//Port 3050 locally or port defined by environment variables configured on the server
app.listen(process.env.PORT || 3050, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
