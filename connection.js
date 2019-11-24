const mongoose = require('mongoose');
const uri = "mongodb+srv://ryan:ZToO0nmvcqwC1ma2@cluster0-zxgud.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(uri,{
    useNewUrlParser: true,
    useCreateIndex: true
}).then(() =>{
  console.log('connected to database');
}).catch(() =>{
  console.log('failed connected to database');
});
