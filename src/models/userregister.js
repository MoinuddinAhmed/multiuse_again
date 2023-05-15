const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    email: String,
    password: String,
    markasadmin: String
});

const User = mongoose.model('User', userSchema);

console.log("user model loaded");

module.exports= User;