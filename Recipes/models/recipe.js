var mongoose = require("mongoose");
var RecipeSchema = new mongoose.Schema({
   name: String,
   image: {
    id: String,
    url: String
   },
   ingredient: String,
   description: String,
   location: String,   // restaurant's location & lat & lng
   lat: Number,
   lng: Number,
   comments: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
         }
      ],
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }      
});

module.exports = mongoose.model("Recipe", RecipeSchema);