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
   - Node.js version 10 or higher (Important! Heavy use of async/await!)
   - NPM version 6 or higher
   - A valid MongoDB connection string URI to a MongoDB database
2. Download the repository
   - `git clone git@github.com:meowmeowcomputers/covrademo.git`
3. Install dependencies
   - Navigate to cloned repo
   - `npm install`
4. Run application
   - Create a .env file with the line `URI=yourURIhere` so the application can connect to the database.
   - Run `npm start`

#### Using the endpoints ####
* `{BaseURL}/users/signup`
  * Any user can submit a POST to this endpoint to register for a User account
  * Body format is:
      ```
      {
	       "userName": "userName",
	       "password": "password"
      }
      ```      
  * User name and password are required.
  * The response will contain the information of the user, with an encrypted password and a bearer token the user can use to authenticate against the other endpoints. Bearer tokens will last 24 hours.
* `{BaseURL}/users/login`
  * Submitting a POST request to this endpoint with this body with valid username and password credentials will result in a response with a bearer you can use to authenticate against all the other endpoints. Bearer tokens will last 24 hours.
      ```
      {
         "userName": "userName",
         "password": "password"
      }
      ```
* `{BaseURL}/users/logout`   
  * A user will need a valid bearer token in the request header to use this endpoint.
  * This will destroy the existing bearer token, and the user will have to use the login endpoint again in order to log in.
* `{BaseURL}/books`
  * A user will need a valid bearer token in the request header to use this endpoint.
  * A GET to this endpoint will return all the books in the database.
  * A POST to this endpoint will add a book to the database. Body format is:
      ```
      {
         "author": "Author Name",
         "title": "Book Title"
      }
      ```
      * Both fields are required.
      * The database will log creation date and who created this book.
* `{BaseURL}/books/:id`
  * A user will need a valid bearer token in the request header to use this endpoint.
  * A GET request to this endpoint will return a book, if the ID exists in the database.
  * A PATCH request to this endpoint will modify the book if the ID exists in the database. Body format is:
      ```
      {
         "author": "Author Name",
         "title": "Book Title"
      }
      ```
      * Either field is optional.
      * Users can only patch books that they have created.
  * A DELETE request to this endpoint will delete the specified book. Users can only delete books they have created.    
* `{BaseURL}/books/myown`
  * A user will need a valid bearer token in the request header to use this endpoint.
  * A GET request to this endpoint will return a list of all books created by the user.
* `{BaseURL}/users/newadmin`
  * A user will need a valid bearer token in the request header to use this endpoint. A user must have an admin account in order to use this endpoint.
  * A POST request to this endpoint will create a new Administrator account. Administrator accounts can add, delete, and modify any book.
