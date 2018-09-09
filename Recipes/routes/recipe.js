var express = require("express");
var router = express.Router();
var Recipe = require("../models/recipe");
var multer     = require('multer');
var cloudinary = require('cloudinary');
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);
// =========== Image Upload Configuration =============
//multer config
const storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
const imageFilter = (req, file, cb) => {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter});

// cloudinary config
cloudinary.config({ 
  cloud_name: 'candong', 
  api_key: 823243289597989, 
  api_secret: process.env.CLOUD_SECRET
});

// Define escapeRegex function to avoid regex DDoS attack
const escapeRegex = text => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

// INDEX -show all recipes
router.get("/", (req, res) => {
  let noMatch = null;
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    console.log(regex);
    if(req.query.searchContent === "name"){
        Recipe.find({name: regex}, function(err, allRecipes) {
          if (err) { console.log(err); }
          else {
            if (allRecipes.length < 1) {
              noMatch = "No recipes found, please try again.";
            }
            res.render("recipes/index", { recipes: allRecipes, page: "recipes", noMatch: noMatch });  
          }
        });
    } else{
        // console.log("++++++++++++++++++");
        Recipe.find({ingredient: regex}, function(err, allRecipes) {
          if (err) { console.log(err); }
          else {
            if (allRecipes.length < 1) {
              noMatch = "No recipes found, please try again.";
            }
            res.render("recipes/index", { recipes: allRecipes, page: "recipes", noMatch: noMatch });  
          }
        });        
    }
  } else {
    Recipe.find({}, function(err, allRecipes) {
      if (err) { console.log(err); }
      else {
        res.render("recipes/index", { recipes: allRecipes, page: "recipes", noMatch: noMatch });  
      }
    }); 
  }
});


router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("recipes/new"); 
});


router.post("/",  middleware.isLoggedIn, upload.single('image'), function(req, res){
    // console.log(req.file);
  cloudinary.uploader.upload(req.file.path, (result) => {
    //   console.log(result);
     // get data from the form
    let { name, image, ingredient, description, author } = { 
      name: req.body.name,
      image: {
        // add cloudinary public_id for the image to the recipe object under image property
        id: result.public_id,
        // add cloudinary url for the image to the recipe object under image property
        url: result.secure_url
      },
      ingredient: req.body.ingredient,
      description: req.body.description,
      // get data from the currenly login user
      author: {
        id: req.user._id,
        username: req.user.username
      }
    };
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress
        
        let newRecipe = {name: name, image: image, ingredient: ingredient, description: description, author: author, location: location, lat: lat, lng: lng};
        Recipe.create(newRecipe, function(err, recipe){
           if(err) console.log(err);
           else {
              console.log(recipe);
               req.flash("success", "Successfully post a new recipe!")
               res.redirect("/recipes");
               
           }
        });
    });
  });
});


router.get("/:id", function(req, res){
   // find the recipe with provided id
   Recipe.findById(req.params.id).populate("comments").exec(function(err, foundRecipe){
    //   console.log(foundRecipe);
      if(err) console.log(err);
      else res.render("recipes/show", {recipe: foundRecipe});
   });
});


// EDIT
router.get("/:id/edit",  middleware.checkRecipeOwership, function(req, res) {
   Recipe.findById(req.params.id, function(err, foundRecipe){
      res.render("recipes/edit", {recipe: foundRecipe});
   });
});

// UPDATA
router.put("/:id", middleware.isLoggedIn, upload.single('image'), function(req, res){
   // no new image uploaded
   if(!req.file){
        let { name, ingredient, description} = { 
          name: req.body.name,
          ingredient: req.body.ingredient,
          description: req.body.description
        };
        geocoder.geocode(req.body.location, function (err, data) {
            if (err || !data.length) {
              req.flash('error', 'Invalid address');
              return res.redirect('back');
            }
            let lat = data[0].latitude;
            let lng = data[0].longitude;
            let location = data[0].formattedAddress;        
            let newRecipe = { name: name, ingredient: ingredient, description: description, location: location, lat: lat, lng: lng};
            Recipe.findByIdAndUpdate(req.params.id, newRecipe, function(err, foundRecipe){
                req.flash("success", "Successfully updated the recipe");
                res.redirect("/recipes/" + req.params.id);
            });
        });
   } else {
        cloudinary.uploader.upload(req.file.path, (result) => {
            let { name, image, ingredient, description, author } = { 
              name: req.body.name,
              image: {
                id: result.public_id,
                url: result.secure_url
              },
              ingredient: req.body.ingredient,
              description: req.body.description
            };
            geocoder.geocode(req.body.location, function (err, data) {
                if (err || !data.length) {
                  req.flash('error', 'Invalid address');
                  return res.redirect('back');
                }
                let lat = data[0].latitude;
                let lng = data[0].longitude;
                let location = data[0].formattedAddress;        
                let newRecipe = { name: name, ingredient: ingredient, description: description, image: image, location: location, lat: lat, lng: lng};
                // cloudinary.uploader.destroy(, (result) => { console.log(result) });
                Recipe.findById(req.params.id, function(err, foundRecipe) {
                    cloudinary.uploader.destroy(foundRecipe.image.id, (result) => { console.log(result) });
                });
                Recipe.findByIdAndUpdate(req.params.id, newRecipe, function(err, foundRecipe){
                    req.flash("success", "Successfully updated the recipe");
                    res.redirect("/recipes/" + req.params.id);
                });
            });        
    });
   }
});

//DELETE
router.delete("/:id",  middleware.checkRecipeOwership, function(req, res){
    Recipe.findById(req.params.id, function(err, foundRecipe) {
        cloudinary.uploader.destroy(foundRecipe.image.id, (result) => { console.log(result) });
    });    
   Recipe.findByIdAndDelete(req.params.id, function(err){
       req.flash("success", "Successfully deleted the recipe");
       res.redirect("/recipes");
   }) 
});




module.exports = router;