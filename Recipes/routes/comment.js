var express = require("express");
var router = express.Router({mergeParams: true});
var Recipe = require("../models/recipe");
var Comment = require("../models/comment");
var middleware = require("../middleware")
//=================================
// Comments ROUTES
//=================================
router.get("/new",  middleware.isLoggedIn,  function(req, res) {
    // find recipe
    Recipe.findById(req.params.id, function(err, foundRecipe){
        if(err) console.log(err);
        else res.render("comments/new", {recipe: foundRecipe});
    });
});

router.post("/",  middleware.isLoggedIn, function(req, res){
   Recipe.findById(req.params.id, function(err, foundRecipe) {
      if(err) {
          console.log(err);
          res.redirect("/recipes");
      } else {
          Comment.create(req.body.comment, function(err, newComment){
             if(err) console.log(err);
             else {
                 // add user name and id to comment
                 newComment.author.id = req.user._id;
                 newComment.author.username = req.user.username;
                 newComment.save();
                 foundRecipe.comments.push(newComment);
                 foundRecipe.save();
                 req.flash("success", "Successfully posted a new comment");
                 res.redirect("/recipes/" + foundRecipe._id);
             }
          });
      }
   });
});

// EDIT
router.get("/:comment_id/edit",  middleware.checkCommentOwership, function(req, res){
   Comment.findById(req.params.comment_id, function(err, foundComment) {
       res.render("comments/edit", {recipe_id: req.params.id, comment: foundComment});
   }); 
});

//UPDATE
router.put("/:comment_id",  middleware.checkCommentOwership, function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, foundComment){
     req.flash("success", "Successfully updated the comment");
     res.redirect("/recipes/" + req.params.id);
   }); 
});

// DELETE
router.delete("/:comment_id",  middleware.checkCommentOwership, function(req, res){
   Comment.findByIdAndDelete(req.params.comment_id, function(err){
       req.flash("success", "Successfully deleted the comment");
       res.redirect("/recipes/" + req.params.id);
   }) 
});

module.exports = router;
