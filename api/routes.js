const { ObjectID } = require('mongodb');
const express = require('express');
const authenticate = require('./authenticate');

const router = new express.Router();
const { User } = require('./models');
const { Books } = require('./models');

// Get all the books
router.get('/books', authenticate, async (req, res) => {
  try {
    let books = await Books.find({});
    res.send(books);
  } catch (error) {
    res.status(500).send();
  }
});

// Get a specific book
router.get('/books/:id', authenticate, async (req, res) => {
  try {
    let book = await Books.findOne({_id:req.params.id});
    res.send(book);
  } catch (error) {
    res.status(500).send();
  }
});

// Get user's own books
router.get('/books/myown', authenticate, async (req, res) => {
  try {
    let books = await Books.find({ createdBy: req.user._id });
    res.send(books);
  } catch (error) {
    res.status(500).send();
  }
});

// Create Books
router.post('/books', authenticate, async (req, res) => {
  let allowedInserts = ['author', 'title'];
  let isValidOperation = validateFields(req.body, allowedInserts);
  if (!isValidOperation) {
    res.status(400).send({ error: 'Invalid Operation!' });
  }
  const book = new Books({
    ...req.body,
    createdBy: req.user._id,
  });
  try {
    await book.save();
    res.status(201).send(book);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Edit Books
router.patch('/books/:id', authenticate, async (req, res) => {
  let _id = req.params.id;
  let updates = Object.keys(req.body);
  let allowedUpdates = ['author', 'title'];
  let isValidOperation = validateFields(req.body, allowedUpdates);
  if (!isValidOperation) {
    res.status(400).send({ error: 'Invalid Operation!' });
  }
  if (!ObjectID.isValid(_id)) {
    res.status(404).send({ error: 'Not Found!' });
  }
  try {
    // Check if admin. If admin, user not limited to their own books to edit.
    let queryObject = adminScope(req.user, _id);
    let book = await Books.findOne(queryObject);
    if (!book) {
      res.status(404).send();
    }

    updates.forEach((update) => book[update] = req.body[update]);
    await book.save();
    res.send(book);
  } catch (error) {
    res.status(400).send();
  }
});

//Find users
router.get('/users', authenticate, async (req, res) => {
  try {
    let userList;
    // Check if admin. If admin, user not limited to themselves to find.
    if (req.user.userType !== 'admin'){
     userList = await User.findOne({_id:req.user._id})
   } else {
     userList = await User.find({});
   }

    if (!userList) {
      res.status(404).send();
    }

    res.send(userList);
  } catch (error) {
    res.status(400).send();
  }
});

//Find a user
router.get('/users/:id', authenticate, async (req, res) => {
  try {
    let user;
    // Check if admin. If admin, user not limited to themselves to find.
    if (req.user.userType !== 'admin'){
      if(req.user._id !== req.id){
        res.status(403).send();
      }
    }
    user = await User.findOne({_id:req.params.id});
    if (!user) {
      res.status(404).send();
    }

    res.send(user);
  } catch (error) {
    res.status(400).send();
  }
});

//Edit users
router.patch('/users/:id', authenticate, async (req, res) => {
  let _id = req.params.id;
  let updates = Object.keys(req.body);
  let allowedUpdates = ['userName', 'password'];
  let isValidOperation = validateFields(req.body, allowedUpdates);
  if (!isValidOperation) {
    res.status(400).send({ error: 'Invalid Operation!' });
  }
  if (!ObjectID.isValid(_id)) {
    res.status(404).send({ error: 'Not Found!' });
  }
  try {
    // Check if admin. If admin, user not limited to themselves to edit.
    if (req.user.userType !== 'admin'){
      if (req.user._id!==_id){
        res.status(403).send();
      }
    }
    let user = await User.findOne({_id:_id});
    if (!user) {
      res.status(404).send();
    }

    updates.forEach((update) => user[update] = req.body[update]);
    //Keep userType the same as model tries to default to 'user'.
    // Users cannot upgrade to admin status
    user.userType = user.userType;
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(400).send();
  }
});

// Add Users
router.post('/users/signup', async (req, res) => {
  let allowedInserts = ['userName', 'password'];
  let isValidOperation = validateFields(req.body, allowedInserts);
  if (!isValidOperation) {
    res.status(400).send({ error: 'Invalid Operation!' });
  }
  let user = new User(req.body);
  try {
    await user.newAuthToken();
    res.status(201).send({ user });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Add Admins
router.post('/users/newadmin', authenticate, async (req, res) => {
  //Only admins can add admin accounts
  if (req.user.userType !== 'admin'){
    res.status(403).send();
  }
  let allowedInserts = ['userName', 'password'];
  let isValidOperation = validateFields(req.body, allowedInserts);
  if (!isValidOperation) {
    res.status(400).send({ error: 'Invalid Operation!' });
  }
  let insertObject = {
    userName: req.body.userName,
    password: req.body.password,
    userType: 'admin'
  }
  let user = new User(req.body);
  try {
    await user.newAuthToken();
    res.status(201).send({ user });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Login
router.post('/users/login', async (req, res) => {
  try {
    let user = await User.checkValidCredentials(req.body.userName, req.body.password);
    let token = await user.newAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

// Logout
router.post('/users/logout', authenticate, async (req, res) => {
  try {
    req.user.token = '';
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

//Delete users
router.delete('/users/:id', authenticate, async (req, res) => {
  let _id = req.params.id;
  let updates = Object.keys(req.body);
  let allowedUpdates = ['userName', 'password'];
  let isValidOperation = validateFields(req.body, allowedUpdates);
  if (!isValidOperation) {
    res.status(400).send({ error: 'Invalid Operation!' });
  }
  if (!ObjectID.isValid(_id)) {
    res.status(404).send({ error: 'Not Found!' });
  }
  try {
    // Check if admin. If admin, user not limited to themselves to delete.
    if (req.user.userType !== 'admin'){
      if (req.user._id!==_id){
        res.status(403).send();
      }
    }
    let user = await User.findOneAndDelete({_id:_id});
    if (!user) {
      res.status(404).send();
    }
    
    res.send(user);
  } catch (error) {
    res.status(400).send();
  }
});

// Delete books
router.delete('/books/:id', authenticate, async (req, res) => {
  let _id = req.params.id;

  if (!ObjectID.isValid(req.user._id)) {
    return res.status(404).send();
  }

  try {
    let queryObject = adminScope(req.user, _id);
    let deleteBook = await Books.findOneAndDelete(queryObject);
    if (!deleteBook) {
      return res.status(404).send();
    }
    res.send(deleteBook);
  } catch (error) {
    res.status(500).send();
  }
});

// Function to check to see if incoming object to POST/PATCH is valid based off
// given defined valid fields in the allowedFields parameter
function validateFields(body, allowedFields) {
  const updates = Object.keys(body);
  const areFieldsValid = updates.every((update) => allowedFields.includes(update));
  return areFieldsValid;
}

// Function to check admin priveliges and return a more open queryObject not restrained by createdBy
function adminScope(user, id) {
  let queryObject;
  if (user.userType === 'admin') {
    queryObject = { _id: id };
  } else {
    queryObject = { _id: id, createdBy: user._id };
  }
  return queryObject;
}

module.exports = router;
