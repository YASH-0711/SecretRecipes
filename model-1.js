  
var mongoose = require('mongoose');
  
var imageSchema = new mongoose.Schema({
    fullname: String,
    email: String,
    phone:Number,
    password: String,
    passwordConf: String,
});
  
//Image is a model which has a schema imageSchema
  
module.exports = new mongoose.model('userinfo', imageSchema);