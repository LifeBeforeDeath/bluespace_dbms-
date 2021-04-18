var express = require("express");
var app = express();
var bodyparser = require("body-parser");
var mongoose = require("mongoose");
var tech = require("./model/camp");
var passport = require("passport");
var localstrategy = require("passport-local");
var User = require("./model/user");
var order = require("./model/order");

mongoose.connect("mongodb://localhost/tech_guru",{useUnifiedTopology:true,useNewUrlParser: true,useCreateIndex:true});
app.use(bodyparser.urlencoded({extended: true}));
app.set("view engine","ejs");


//pasport configuration
app.use(require("express-session")({
	secret:"kaladin is the best character ever written",
	resave:false,
	saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localstrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req,res,next){
	res.locals.currentuser = req.user;
	next();
});


//********** technological pages ***********//
app.get("/",function(req,res){
	res.render("landing");
});
app.get("/front",isLoggedIn,function(req,res){
	tech.find({},function(err,technology){
		if(err){
			console.log(err);
		}else{
			res.render("front",{technology:technology});
		}
	});
});
app.get("/front/new",function(req,res){
	res.render("new");
});
app.post("/front",isLoggedIn,function(req,res){
	var image=req.body.image;
	var name=req.body.name;
	var desc=req.body.description;
	var author = {
		id:req.user._id,
		username:req.user.username
	}
	var newcampground = {name:name,image:image,description:desc,author:author}
	tech.create(newcampground,function(err,newlycreated){
		if(err){
			console.log(err);
		}else{
			res.redirect("/front");
		}
	});
});
app.get("/front/:id",function(req,res){
	tech.findById(req.params.id).populate("comments").exec(function(err,foundcampground){
		if(err){
				console.log(err);
		}else{
			res.render("show",{technology:foundcampground});
		}
	});
});
//****order routes ****
app.get("/front/:id/order/new",function(req,res){
	tech.findById(req.params.id,function(err,corder){
		if(err){
			console.log(err);
		}else{
			res.render("neworder",{corder:corder});
		}
	});
});
app.post("/front/:id/order",function(req,res){

	var name=req.body.name;
	var phone=req.body.phone;
	var email=req.body.email;
	var pincode = req.body.pincode;
	var address = req.body.address;
	
	var neworder = {name:name,phone:phone,email:email,address:address,pincode:pincode}

	tech.findById(req.params.id,function(err,campground){
		if(err){
			console.log(err);
			res.redirect("/front");
		}else{
			order.create(neworder,function(err,newlyorder){
				if(err){
					console.log(err);
				}else{
					res.redirect("/front/" + campground._id);
				}
			});
		}
	});
});

//*************login/signup***************
//register***********
app.get("/register",function(req,res){
	res.render("register");
});
app.post("/register",function(req,res){
	User.register(new User({username:req.body.username}),req.body.password,function(err,user){
		if(err){
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local")(req,res,function(){
			res.redirect("/front");
		});
	});
});
//login *******************
app.get("/login",function(req,res){
	res.render("login",{currentuser:req.user});
});
app.post("/login",passport.authenticate("local",{
	successRedirect:"/front",
	failureRedirect:"/login"
}),function(req,res){

});
app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
});


//******not logged in function*****
function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}


app.listen(8000,function(){
	console.log("server has started");
});