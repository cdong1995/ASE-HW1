var mongoose    =    require("mongoose"),
    Recipe  =    require("./models/recipe"),
    Comment     =   require("./models/comment");

var data =[
        {
            name: "Cloud's Rest",
            image: "https://pixabay.com/get/e834b70c2cf5083ed1584d05fb1d4e97e07ee3d21cac104496f5c27ba2edb5b1_340.jpg",
            description: "blah blah blah"
        },
        {
            name: "Desert Mesa",
            image: "https://pixabay.com/get/e136b60d2af51c22d2524518b7444795ea76e5d004b0144290f3c37ca7edbc_340.jpg",
            description: "blah blah blah"
        },
        {
            name: "Beach",
            image: "https://www.photosforclass.com/download/pixabay-182951?webUrl=https%3A%2F%2Fpixabay.com%2Fget%2Fe83db3062df51c22d2524518b7444795ea76e5d004b0144290f4c47ea3eab5_960.jpg&user=Hans",
            description: "blah blah blah"
        }
    ];

function seedDB() {
    //Remove all recipes
    Recipe.remove({}, function(err){
        if(err) console.log(err);
        console.log("removed recipes!");
        // add new recipes
        // data.forEach(function(seed){
        //   Recipe.create(seed, function(err, recipe){
        //       if(err) console.log(err);
        //       else {
        //           console.log("add new recipe");
        //           Comment.create(
        //               {
        //                   text: "This is a great place",
        //                   author: "Can Dong"
        //               },function(err, comment){
        //                   if(err) console.log(err);
        //                   else {
        //                       recipe.comments.push(comment);
        //                       recipe.save();
        //                       console.log("created new comment");
        //                   }
        //               })
        //       }
        //   }) 
        // });
    })
}

module.exports = seedDB;