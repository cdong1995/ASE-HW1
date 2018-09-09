var express         =       require("express"),
    app             =       express(),
    bodyParser      =       require("body-parser"),
    methodOverride  =       require("method-override"),
    flash           =       require("connect-flash"),
    mongoose        =       require("mongoose"),
    passport        =       require("passport"),
    LocalStrategy   =       require("passport-local"),
    Recipe      =           require("./models/recipe"),
    Comment         =       require("./models/comment"),
    User            =       require("./models/user"),
    seedDB          =       require("./seeds");

var commentRoutes   =       require("./routes/comment"),
    recipeRoutes=       require("./routes/recipe"),
    indexRoutes     =       require("./routes/index");


// seedDB();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
var url = process.env.DATABASEURL || "mongodb://localhost/recipe";
mongoose.connect(url);


// Recipe.create({
//     name: "Lanxi",
//     image: "https://images.pexels.com/photos/210186/pexels-photo-210186.jpeg?cs=srgb&dl=cascade-clouds-cool-wallpaper-210186.jpg&fm=jpg"
// }, function(err, recipe){
//   if(err) console.log(err);
//   else console.log(recipe);
// });


// PASSPORT CONFIG  
app.use(require("express-session")({
    secret: "DC love DYT",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.get("/", function(req, res){
   res.render("landing"); 
});

app.use("/recipes", recipeRoutes);
app.use("/recipes/:id/comments", commentRoutes);
app.use("/", indexRoutes);



app.listen(process.env.PORT, process.env.IP, function(){
   console.log("yelpcamp service started!"); 
});