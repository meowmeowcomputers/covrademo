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
  - [X] Use of GraphQL

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
   - Create a .env file with the lines `URI=yourURIhere` so the application can connect to the database, and `JWT_SECRET=` with the JTW_SECRET I will be providing you.
   - Run `npm start`

#### Using the GraphQL endpoint ####
* The GraphQL endpoint is `{BaseURL}/graphql`
* All requests should be submitted as a POST request in GraphQL format to the GraphQL endpoint
* User Mutations
  * To sign up for an account, send your form in this format:
    ```
    mutation {
      signup(userName:"userName",password:"password")
    }
    ```
    The API will respond with a bearer token that you can use to access the other queries and mutations of the API.
  * To sign in to get another bearer token, send your valid credentials in this format:
    ```
    mutation {
      login(userName:"userName",password:"password")
    }
    ```
    The API will respond with a bearer token that you can use to access the other queries and mutations of the API.
* User Queries
  * Get all users. `id`,`userName`, and `books` as well as the sub-attributes are optional as data that can be returned.
    ```
    {
      users{
          id
          userName
          books{
              id
              title
              author
         }
      }
    }
    ```
  * Get a specific user by ID, User Name, or both
    ```
    {
      user(id:"userId", userName:"username"){
          id
          userName
          books{
              id
              title
              author
          }
      }
    }
    ```
* Book Mutations
  * Add a new book. Title and author are required.
    ```
    mutation{
       addBook(title:"New Book",author:"New Book Author"){
           id
           title
           createdBy {
               userName
               id
           }
       }
    }  
    ```
  The API will reply with the book's attributes. At least one query attribute must be supplied when creating the book (id, title, or author).
  * Delete a book. Either title or book ID can be used to specify the book to be deleted. Admin accounts can delete any book.
    ```
    mutation{
       deleteBook(title:"Book title to be deleted", id:"ID of book to be deleted"){
           id
           title
           author
           createdBy{
               id
               userName
           }
       }
    }
    ```
  The API will reply with the book's attributes. At least one query attribute must be supplied when deleting the book (id, title, or author).
  * Edit a book. Either title or book ID can be used to specify the book to be edited. Admin accounts can edit any book. `title` and `author` inside the `input` object are optional, and specify the new title or author of the book.
    ```
    mutation{
       editBook(
         title:"Book title to be edited",
         id:"ID of book to be edited"
         input:
         {
           title:"A Modified book Title",
           author:"A Modified Author"
         }){
           id
           title
           author
           createdBy{
               id
               userName
           }
       }
    }
    ```
* Book Queries
  * Get all books. `id`,`title`, and `author` as well as the sub-attributes are optional as data that can be returned.
    ```
    {
      books{
          id
          title
          author
          createdBy{
              id
              userName
         }
      }
    }
    ```
  * Get a specific book by ID, title, or both
    ```
    {
      book(id:"bookId", title:"Book Title you are searching for"){
        id
        title
        author
        createdBy{
            id
            userName
       }
      }
    }
    ```

#### Using the REST endpoints ####
* `{BaseURL}/rest/users/signup`
  * Any user can submit a POST to this endpoint to register for a User account
  * Body format is in raw JSON:
      ```
      {
	       "userName": "userName",
	       "password": "password"
      }
      ```      
  * User name and password are required.
  * The response will contain the information of the user, with an encrypted password and a bearer token the user can use to authenticate against the other endpoints. Bearer tokens will last 24 hours.
* `{BaseURL}/rest/users/login`
  * Submitting a POST request to this endpoint with this body with valid username and password credentials will result in a response with a bearer token you can use to authenticate against all the other endpoints. Bearer tokens will last 24 hours.
      ```
      {
         "userName": "userName",
         "password": "password"
      }
      ```
* `{BaseURL}/rest/users/logout`   
  * A user will need a valid bearer token in the request header to use this endpoint.
  * This will destroy the existing bearer token, and the user will have to use the login endpoint again in order to log in.
* `{BaseURL}/rest/books`
  * A user will need a valid bearer token in the request header to use this endpoint.
  * A GET to this endpoint will return all the books in the database.
  * A POST to this endpoint will add a book to the database. Body format is in raw JSON:
      ```
      {
         "author": "Author Name",
         "title": "Book Title"
      }
      ```
      * Both fields are required.
      * The database will log creation date and who created this book.
* `{BaseURL}/rest/books/:id`
  * A user will need a valid bearer token in the request header to use this endpoint.
  * A GET request to this endpoint will return a book, if the ID exists in the database.
  * A PATCH request to this endpoint will modify the book if the ID exists in the database. Body format is in raw JSON:
      ```
      {
         "author": "Author Name",
         "title": "Book Title"
      }
      ```
      * Either field is optional.
      * Users can only patch books that they have created.
  * A DELETE request to this endpoint will delete the specified book. Users can only delete books they have created.    
* `{BaseURL}/rest/books/myown`
  * A user will need a valid bearer token in the request header to use this endpoint.
  * A GET request to this endpoint will return a list of all books created by the user.
* `{BaseURL}/rest/users/newadmin`
  * A user will need a valid bearer token in the request header to use this endpoint. A user must have an admin account in order to use this endpoint.
  * A POST request to this endpoint will create a new Administrator account. Administrator accounts can add, delete, and modify any book.
* `{BaseURL}/rest/users`
  * A user will need a valid bearer token in the request header to use this endpoint.
  * A GET request will return a list of all users in the database. If a user is not an admin,
  then this endpoint will only return themselves.
* `{BaseURL}/rest/users/:id`
  * A user will need a valid bearer token in the request header to use this endpoint.
  * A GET request will return a specified user by ID, if it exists. If a user is not an admin,
  then this endpoint will only return themselves if the correct ID is supplied.
  * Submitting a PATCH request to this endpoint with this body (either field is optional)
  will edit the user. Admins can edit anyone, and users can edit themselves. This can be used
  to change a userName or password. Users cannot be upgraded to admins. Admins cannot be downgraded to users.
      ```
      {
         "userName": "userName",
         "password": "password"
      }
      ```
  * A DELETE request will delete this user. Admins can delete anyone, and users can delete themselves.
