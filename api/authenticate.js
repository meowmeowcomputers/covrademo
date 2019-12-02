
const jwt = require('jsonwebtoken');
const { User } = require('../db/models');

// This is the authentication function for REST endpoints. It receives a bearer token from the header of the
// REST request and uses jsonwebtoken to decode the token.
// The decoded token should return a proper user ID that exists in the database.
// The function will then assign the user found to req.user for the app to use
// in additional verification logic.
const authenticate = async (req, res, next) => {
  try {
    let token = req.header('Authorization').replace('Bearer', '').trim();
    let decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = await User.findOne({ _id: decoded._id, token });
    if (!user) {
      throw new Error();
    }
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).send({ error: 'Please authenticate!' });
  }
};

module.exports = authenticate;
