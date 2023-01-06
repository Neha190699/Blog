//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
var dotenv = require('dotenv');
dotenv.config();

const homeStartingContent = "This is a Daily Journal Web App where you can write your day to day activities or you can take it as diary writing BLOG where you can write whatever you want.It also provides facilities of updating and deleting a particular post.Just hit the COMPOSE button to create your first post.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//connecting mongoose with database mongodb
mongoose.connect("mongodb+srv://admin-neha:nehamongodbatlas@journal-cluster.d8nq1.mongodb.net/blogDB", {useNewUrlParser: true,  useUnifiedTopology: true , useFindAndModify: false });
let posts = [];
let newusers = [];
let users = [];
let globalpass=" ";
let globalEmail=" ";

const newuserSchema ={    //signup users
  name:String,
  email:String,
  password:String,
}

 const blogSchema ={
    email:String,
    password:String,
    title:String,
    content:String
 }
 const adminSchema ={
  name:String,
  password:String,
}
 

const Post = mongoose.model('post',blogSchema);
const User = mongoose.model('user',newuserSchema);
const Admin = mongoose.model('admin',adminSchema);


app.get("/",function(req, res){
  Post.find({}, function(err, posts){
    res.render("index", {
      startingContent: homeStartingContent,
      posts: posts
      });
  });

});

app.get("/home",function(req, res){
  Post.find({email:globalEmail,password:globalpass}, function(err, posts){
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
      });
  });

});
app.get("/compose",function(req, res){
  res.render('compose',{txt:null,txtarea:null,mssg:null});
});
app.get("/contact",function(req, res){
  res.render("contact");
});
app.get("/signin",function(req, res){
  res.render("signin");
});
app.get("/signup",function(req, res){
  res.render("signup");
});
app.get("/index",function(req, res){
  res.render("index");
});
app.get("/admin_signin",function(req, res){
  res.render('admin_signin');
});

app.post("/signup", function(req, res){
  var userName = req.body.userName;
  var userEmail = req.body.email;
  var userPass = req.body.password;
  
   const input = new User({
     name:userName,
     email:userEmail,
     password:userPass
   });
  globalpass=userPass;
  globalEmail=userEmail;
  
     input.save();
   res.redirect("/home");
  

});

app.post("/signin", function(req, res){
  var userEmail = req.body.email;
  var userPass = req.body.password;
  globalpass=userPass;
  globalEmail=userEmail;

  User.find({email:userEmail,password:userPass}, function(err, result) {
    if(err)
    console.log("User doen't exists");
    else
    {
      Post.find({email:userEmail,password:userPass}, function(err, posts){
         res.render("home", {
          startingContent: homeStartingContent,
          posts:posts
          
      });
         
       });
    }
   });

 
});
app.get("/post/:topic",function(req, res){
  var requestedURL=req.params.topic;
  
    Post.find({title:requestedURL}, function(err, result) {
      if(err)
     return handleError(err);
      else
      {
         res.render("post",{title:result[0].title, content:result[0].content});  
      }
    });
});
    //Read
app.get("/compose/:topic",function(req, res){
  var requestedURL=req.params.topic;
  
  Post.find({title:requestedURL}, function(err, result) {
    if(err)
    console.log(err);
    else
    {
      //id = result[0]._id;
       res.render("compose",{txtarea:result[0].content, txt:requestedURL,mssg:null});  
    }
   });
  });
  //UPDATE
  app.post("/compose/:topic",function(req, res){
     const prevTitle = req.params.topic;
      //Updating document
    const updatedTitle = req.body.composeText;
    const updatedContent = req.body.content;
    Post.findOneAndUpdate({title:prevTitle},{title:updatedTitle,content:updatedContent},function(err,res)
    {
      if(err) 
      console.log(err); 
    });
    var m = "Updated Successfully";
    res.render("compose", {txtarea:null,txt:null,mssg:m});

  });
//DELETE A DOCUMENT
app.post("/post/:topic",function(req, res)
{
   
   const delItem = req.params.topic;
   console.log(delItem);
    Post.deleteOne({title:delItem},function(err)
    {
      if(err) //return handleError
      console.log(err);
    });
    Post.find({email:globalEmail,password:globalpass}, function(err, posts){
      res.render("home", {
        startingContent: homeStartingContent,
        posts: posts
        });
});
});
  
app.post("/compose",function(req, res){
  var userTitle = req.body.composeText;
  var userPost = req.body.content;
  let input;
    User.find({password:{ $eq:globalpass}},function(err, res)
  {
    if(err)
    console.log(err);
    else{

         input = new Post({
        email:globalEmail,
        password:globalpass,
        title:userTitle,
        content:userPost
      });
      posts.push(input);
       input.save();
    } 
  });
  
  Post.find({email:globalEmail,password:globalpass}, function(err, posts){
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
      });
  }); 
  

    
});
app.post("/admin_signin",function(req, res){
  var name = req.body.adname;
  var pass = req.body.adpass;
  Admin.find({Name:name,password:pass}, function(err){
    User.find({}, function(err, users) {
      if(err)
      console.log(err);
      else
        res.render("admin_home",{users:users});
      
     });
    
  }); 
 
});
app.get("/user/:email",function(req, res){
  const requestedemail = req.params.email;
  Post.find({email:requestedemail}, function(err, result){
    if(err)
    console.log(err);
    else
   res.render('admin_post',{result:result});

  });
});


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started .");
});
