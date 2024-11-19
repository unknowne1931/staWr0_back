const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
      
    Time : String,
    pass : String,
    email : String,
    username : String,
    name : String,

});

module.exports = mongoose.model('Pass', UsersSchema);
