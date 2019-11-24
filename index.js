"use strict"

const express = require("express");
const app = express();
const parser = require("body-parser");
// const MongoClient = require('mongodb').MongoClient;
const authenticate  = require('./authenticate')
const {ObjectID}  = require('mongodb')

require('./connection');
//ZToO0nmvcqwC1ma2
const uri = "mongodb+srv://ryan:ZToO0nmvcqwC1ma2@cluster0-zxgud.mongodb.net/test?retryWrites=true&w=majority";

// const uri = "mongodb+srv://ryan:ZToO0nmvcqwC1ma2@cluster0-zxgud.mongodb.net/test?retryWrites=true&w=majority";
// let db;
// MongoClient.connect(uri, (err, client) => {
//   db = client.db('library')
//   // const collection = client.db("test").collection("devices");
//   // // perform actions on the collection object
//   // client.close();
// });
const User = require('./models').User;
const Book = require('./models').Book;

app.use( parser.json() );

//Get Books
app.get('/books',authenticate, async (req,res)=>{
  try {
    const books = await Book.find({})
    res.send(books)
  } catch (error) {
      res.status(500).send()
  }
});

//Get Books
app.get('/books/myown',authenticate, async (req,res)=>{
  try {
    const books = await Book.find({createdBy: req.user._id})
    res.send(books)
  } catch (error) {
      res.status(500).send()
  }
});

//Create Books
app.post('/books',authenticate, async(req,res)=>{
  let returnObject = {
    title:'',
    user:'',
  }
  const book =  new Book({
      ...req.body,
      createdBy: req.user._id
  })
  try {
      await book.save()
      res.status(201).send(book)
  } catch (error) {
      res.status(400).send(error)
  }
});

//Edit Books
app.patch('/books/:id',authenticate,async (req, res)=>{
  let patchObject = {
    id:'',
    title: '',
    user:'derived from req'
  }
  const _id = req.params.id
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "title"]
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
  if(!isValidOperation){
      res.status(400).send({error:"Invalid Operation!"})
  }
  if (!ObjectID.isValid(_id)) {
      res.status(404).send();
  }
  try {
      const book = await Book.findOne({_id: req.params.id, createdBy:req.user._id})

     if(!book){
      res.status(404).send();
     }

     updates.forEach((update) => book[update] = req.body[update])
     await book.save()

     res.send(book);
  } catch (error) {
      res.status(400).send();
  }
})

//Get Users
app.get('/users',(req,res)=>{
  let returnObject = {
    userId:''
  }
});

//Add Users
app.post('/users/signup', async(req,res)=>{
  let postObject = {
    userName:'',
    passWord:'',
  };
  const user = new User(req.body);
    try{
        const token =  await user.newAuthToken()
        res.status(201).send({user})
    }catch(e){
        res.status(400).send(e)
    }
})

//Login
app.post('/users/login', async(req,res)=>{
  let postObject = {
    userName:'',
    passWord:'',
  }
  try {
     const user  = await User.checkValidCredentials(req.body.userName, req.body.password);
     const token = await user.newAuthToken();
     res.send({ user, token})
 } catch (error) {
     res.status(400).send()
 }
})

//Logout
app.post('/users/logout', authenticate, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) =>{
         return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

app.listen(process.env.PORT || 3050, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
