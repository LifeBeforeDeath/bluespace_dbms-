var mongoose = require("mongoose");
var PML = require("passport-local-mongoose");
var userschema = new mongoose.Schema({
	username:String,
	password:String
});
userschema.plugin(PML);
module.exports = mongoose.model("User",userschema);