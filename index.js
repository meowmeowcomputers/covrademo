const express = require("express");
const app = express();
const parser = require("body-parser");
const routes = require("./api/routes")
const { graphqlExpress } = require('apollo-server-express')
const schema = require('./api/schema');
const expressJwt = require('express-jwt')

//Connect to mongodb database
require("./db/connection");
//Look for .env configuration file to use environmental variables
require("dotenv").config();

//Old REST routes
app.use(parser.json(),routes);

// auth middleware for graphql. I wish I could use the authenticate script I wrote for REST,
// but this seemed simpler in delivering a graphql solution.
const auth = expressJwt({
  secret: process.env.JWT_SECRET,
  credentialsRequired: false
})

app.use('/graphql', parser.json(), auth, graphqlExpress(req => ({
     schema,
     context: {
       user: req.user
     }
   }))
);

app.listen(process.env.PORT || 3050, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
