var mongoose = require("mongoose");
var campgroundschema = new mongoose.Schema({
	name:String,
	phone:Number,
	email:String,
	address:String,
	pincode:Number

	
});
module.exports = mongoose.model("order",campgroundschema);