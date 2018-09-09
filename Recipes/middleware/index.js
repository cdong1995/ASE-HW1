var Recipe = require("../models/recipe")
var Comment = require("../models/comment")
var middlewareObj = {};

middlewareObj.checkRecipeOwership = function(req, res, next) {
    if(req.isAuthenticated()){
        Recipe.findById(req.params.id, function(err, foundRecipe) {
            if(err) {
                res.redirect("back");
            } else {
                if(foundRecipe.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to log in to do that");
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwership = function(req, res, next) {
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err) {
                res.redirect("back");
            } else {
                if(foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to log in to do that");
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next) {
    if(req.isAuthenticated()) {
        next();
    } else {
        req.flash("error", "You need to log in to do that");
        res.redirect("/login");
    }
}

module.exports = middlewareObj;