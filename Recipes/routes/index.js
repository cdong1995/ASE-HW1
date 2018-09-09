var express = require("express");
var router = express.Router();
var User = require("../models/user");
var passport = require("passport");


router.get("/register", function(req, res) {
   res.render("register"); 
});

router.post("/register", function(req, res) {
   var newUser = new User({username: req.body.username}); 
   User.register(newUser, req.body.password, function(err, user){
       if(err) {
           req.flash("error",err.message);
           return res.render("register");
       } 
       passport.authenticate("local")(req, res, function(){
           req.flash("success", "Welcome to Chinese Food Recipes: " + user.username);
           res.redirect("/recipes");
       })
    });
});

router.get("/login", function(req, res) {
   res.render("login"); 
});

router.post("/login", passport.authenticate("local", {
   successRedirect: "/recipes",
   failureRedirect: "/login"
    }), function(req, res) {
});

router.get("/logout", function(req, res) {
   req.logout();
   req.flash("success", "Successfully log out");
   res.redirect("/recipes");
});

module.exports = router;