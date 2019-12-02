/*jshint esversion: 9 */

const { User } = require('../db/models');
const { Books } = require('../db/models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
require('dotenv').config()

function isAdmin(user){
  console.log(user)
  if (user.userType === 'admin'){
    return true
  } else {
    return false
  }
}
const resolvers = {
  Query: {
    users: async (_,__,{ user }) => {
      try{
        if (!user) {
          throw new Error('You are not authenticated!')
        }
      let returnUsers = await User.find({})
      return returnUsers
      } catch (err) {
        return err;
      }
    },
    user: async (parent, args, { user }) => {
      try{
        if (!user) {
          throw new Error('You are not authenticated!')
        }
        if(args.id){
          args._id = args.id
          delete args.id
        }
        let returnUser = await User.findOne(args);
        return returnUser;
      } catch (err) {
        return err
      }
    },
    books: async (_,__,{user}) => {
      try {
        if (!user) {
          throw new Error('You are not authenticated!')
        }
        let allBooks = await Books.find({});
        return allBooks
      } catch (err) {
        return err
      }
    },
    book: async (parent, args, {user}) => {
      try {
        if (!user) {
          throw new Error('You are not authenticated!')
        }
        if(args.id){
          args._id = args.id
          delete args.id
        }
        let book = await Books.findOne(args)
        return book;
      } catch (err) {
        return err
      }
    },
    // fetch the profile of currently authenticated user
    async me (_, args, { user }) {
      // make sure user is logged in
      if (!user) {
        throw new Error('You are not authenticated!')
      }
      // user is authenticated
      return await User.findOne({_id:user._id})
  }
},
  Book: {
    createdBy: async (parent) => {
      const { id } = parent
      return await User.findOne({_id:parent.createdBy})
    }
  },
  User: {
    books: async (parent) => {
      let returnUser = await Books.find({createdBy:parent._id})
      return returnUser
    }
  },
  Mutation: {
      // Handle user signup
      async signup (_, { userName, password }) {
       try{
        let user = await new User({
          userName: userName,
          password: password
        })
        await user.newAuthToken();
        // return json web token
        return user.token;
      } catch(err){
          return err
        }
      },

    // Handle user login
    async login (_, { userName, password }) {
      const user = await User.findOne({ userName:userName })

      if (!user) {
        throw new Error('Unable to login, user/password combination not found');
      }
      const valid = await bcrypt.compare(password, user.password)

      if (!valid) {
        throw new Error('Unable to login, user/password combination not found');
      }

      // return json web token
      return jwt.sign(
        { _id: user.id},
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      )
    },

    //Handle book addition
    async addBook(_, {title, author}, {user}){
      let newBook = new Books({
        title:title,
        author:author,
        createdBy: user._id
      });
      await newBook.save();
      return newBook
    },

    //Handle book deletion
    async deleteBook(_,args,{user}){
      try{
        if (!user) {
          throw new Error('You are not authenticated!')
        }
        if(args.id){
          args._id = args.id
          delete args.id
        }
        let deleteThisBook;
        let thisUser = await User.findOne({_id:user._id});
        //Admins can delete any book, while users can delete only their books
        if(isAdmin(thisUser)){
          deleteThisBook = await Books.findOneAndDelete(args);
        } else{
          let checkBook = await Books.findOne(args);
          if (!checkBook){
            throw new Error('Book not found!');
          }
          if(checkBook.createdBy.toString() !== user._id) {
            throw new Error('You cannot delete books you did not create!')
          } else {
            deleteThisBook = await Books.findOneAndDelete(args);
          }
        }
        if(!deleteThisBook){
          throw new Error('Book not found!');
        }
        return deleteThisBook;
      } catch(err){
        return err
      }
    },
    //Handle editing a book
    async editBook(_,args,{user}){
      try{
        let queryObject= {};
        if(args.id){
          args._id = args.id;
          queryObject._id = args._id;
          delete args.id;
        }
        if(args.title){
          queryObject.title = args.title;
        }
        if (!user) {
          throw new Error('You are not authenticated!')
        }
        if (!args.input) {
          throw new Error('No input!')
        }
        let input = args.input
        let updates = Object.keys(input);

        console.log(queryObject)
        let bookToEdit = await Books.findOne(queryObject);
        console.log(bookToEdit)
        if(!bookToEdit){
          throw new Error('Book not found!')
        }
        updates.forEach((update) => bookToEdit[update] = input[update]);
        bookToEdit.save();
        return bookToEdit
      } catch(err){
        return err
      }
    },
  }
}

module.exports=resolvers;
