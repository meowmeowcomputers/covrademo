const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const BookSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
    },
    author:{
        type: String,
        required:true,
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
});

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique:true,
  },
  password:{
       type:String,
       required:true,
       trim:true,
       minlength: 7,
       validate(value){
           if(validator.isEmpty(value)){
               throw new Error('Please enter your password!')
           }else if(validator.equals(value.toLowerCase(),"password")){
               throw new Error('Password is invalid!')
           }else if(validator.contains(value.toLowerCase(), "password")){
               throw new Error('Password should not contain password!')
           }
       }
   },
   token:{
        type:String,
   },
   createdAt:{
       type: Date,
       default: Date.now
   }
});

UserSchema.methods.newAuthToken = async function(){
    const user  = this
    const token = jwt.sign({ _id: user.id.toString() },'library-secretkey', {expiresIn: "1 day"})
    user.token = token;
    console.log(user)
    await user.save()
    console.log(token)
    return token
}

UserSchema.pre('save', async function(next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

UserSchema.statics.checkValidCredentials = async (userName, password) => {
    const user = await User.findOne({userName})

    if(!user){
        throw new Error('Unable to login 2')
    }
    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch){
        throw new Error('Unable to login 2')
    }
    console.log(isMatch)
    return user
}

const User = mongoose.model('User', UserSchema);

const Book = mongoose.model('Book', BookSchema);

module.exports = {Book,User}
