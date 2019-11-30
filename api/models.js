const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    validate(value) {
      if (validator.isEmpty(value)) {
        throw new Error('Please enter your password!');
      } else if (validator.equals(value.toLowerCase(), 'password')) {
        throw new Error('Password is invalid! Please enter a stronger password!');
      } else if (validator.contains(value.toLowerCase(), 'password')) {
        throw new Error('Password should not contain the word password!');
      }
    },
  },
  token: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userType: {
    type: String,
    required: true,
    default: 'user',
  },
});

UserSchema.methods.newAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user.id.toString() },
    'library-secretkey', { expiresIn: '1 day' });
  user.token = token;
  await user.save();
  return token;
};

UserSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

UserSchema.statics.checkValidCredentials = async (userName, password) => {
  // Find the user and the encrypted password
  const user = await User.findOne({ userName });
  // If user doesn't exist return an error. Kept error uniform with password mismatch
  // for the sake of security
  if (!user) {
    throw new Error('Unable to login, user/password combination not found');
  }
  // Compare stored password to password given in login. Bcrpyt used in lieu of password literal
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Unable to login, user/password combination not found');
  }

  return user;
};

const User = mongoose.model('User', UserSchema);

const Books = mongoose.model('Books', BookSchema);

module.exports = { Books, User };
