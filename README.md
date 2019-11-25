# covrademo
The purpose of this project is to demonstrate my practical skills in creating an API.  

Basic requirements:
---------------
  * A RESTful API  
  * This API will be able to create users  
  * Users will be able to add create, update, and delete a data item, books  
  * Users will be able to see their books, as well as the books that other users have created  
  * Users will be able to create accounts for themselves  
  * Users can be authenticated  
  * MongoDB will be used as the primary database for this project  

Stretch Goals:  
---------------
  - [X] Administrator users can create/modify/delete any book of any user  
  - [X] A deployed solution `https://ryan-library-api.herokuapp.com/` can be used as a base URL
  - [ ] A websocket that publishes new posts
  - [ ] Deployable to AWS Lambda
  - [ ] JSON API standard
  - [ ] Rate limiting with an API key  
  - [ ] Use of TypeScript
  - [ ] Use of GraphQL

Using this API
=============
#### Installing the package ####
1. Prerequisites
  1. Node.js version 10 or higher (Important! Heavy use of async/await!)
  2. NPM version 6 or higher
  3. A valid MongoDB connection string URI to a MongoDB database
2. Download the repository
  1. `git clone git@github.com:meowmeowcomputers/covrademo.git`
3. Install dependencies
  1. Navigate to cloned repo
  2. `npm install`
4. Run application
  1. Create a .env file with the line `URI=yourURIhere` so the application can connect to the database.
  2. Run `npm start`

#### Using the endpoints ####
* `{BaseURL}\users\signup`
  * Any user can submit a POST to this endpoint to register for a User account
  * Body format is
      ```
      {
	       "userName": "userName",
	        "password": "password"
      }
      ```      
