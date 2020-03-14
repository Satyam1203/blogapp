const server = require('http').createServer();

var express= require("express"),
    app= express(),
    bodyParser= require("body-parser"),
    mongoose= require("mongoose"),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer");

// const checksum_lib = require('./checksum/checksum.js');

    mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
//connecting to db
mongoose.connect("mongodb://localhost/restfulBlogApp"); 

app.set("view engine","ejs"); 
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

//schema 
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    desc: String,
    added: {type:Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "Blog 1",
//     image: "https://cdn.pixabay.com/photo/2014/05/02/21/50/home-office-336378_960_720.jpg",
//     desc: "This is a demo blog created to add some data to the database"
// });

//RESTful routes 

app.get("/", (req,res)=>{
    res.redirect("/blogs");
});

//INDEX route
app.get("/blogs", (req,res)=>{
    Blog.find({}, (err,blogs)=>{
        if(err){
            console.log(err);
        }else{
            res.render("index", {blogs:blogs});
        }
    });
});

//NEW route
app.get("/blogs/new", (req,res)=>{
    res.render("new");
});

//CREATE route
app.post("/blogs", (req,res)=>{
    var title = req.body.title;
    var image = req.body.image;
    var desc = req.sanitize(req.body.desc);
    
    Blog.create({title:title,image:image,desc:desc}, (err,blogs)=>{
        if(err){
            console.log(err);
        }else{
            res.redirect("/blogs");
        }
    });
});

//SHOW route
app.get("/blogs/:id", (req,res)=>{
    Blog.findById(req.params.id, (err,blog)=>{
        if(err){
            res.redirect("/blogs");
        }else{
            res.render("show", {blog:blog});
        }
    });
});

//EDIT route
app.get("/blogs/:id/edit",(req,res)=>{
    Blog.findById(req.params.id, (err,blog)=>{
       if(err){
           res.redirect("/blogs");
       } else{
           res.render("edit",{blog:blog});
       }
    });
});

//UPDATE route
app.put("/blogs/:id", (req,res)=>{
    var title = req.body.title;
    var image = req.body.image;
    var desc = req.sanitize(req.body.desc);
    
    Blog.findByIdAndUpdate(req.params.id, 
        {title:title, image:image, desc:desc},
        (err, blog)=>{
            if(err){
                res.redirect("/blogs");
            }else{
                res.redirect("/blogs/"+req.params.id);
            }
        });
});

//DELETE route 
app.delete("/blogs/:id", (req,res)=>{
    Blog.findByIdAndRemove(req.params.id, (err,blog)=>{
        if(err){
            res.send("Can't delete, Try again");
        } else{
            res.redirect("/blogs");
        }
    });
});

app.listen(80, '0.0.0.0', ()=>{
    console.log("Server Started");
});

server.listen(3000);