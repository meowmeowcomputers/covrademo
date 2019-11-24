
const jwt  = require('jsonwebtoken')
const User = require('./models').User

const authenticate = async (req,res,next) => {
    try {
        const token = req.header('Authorization').replace('Bearer', '').trim()
        console.log(token)
        const decoded  = jwt.verify(token, 'library-secretkey')
        const user  = await User.findOne({ _id:decoded._id, 'token': token})
        if(!user){
            throw new Error()
        }
        req.token = token
        req.user = user
        next()
    } catch (error) {
        console.log(error)
        res.status(401).send({error:'Please authenticate!'})
    }
}

module.exports = authenticate
