//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
var dotenv = require('dotenv');
dotenv.config();

const homeStartingContent = "This is a Daily Journal Web App where you can write your day to day activities or you can take it as diary writing BLOG where you can write whatever you want.It also provides facilities of updating and deleting a particular post.Just hit the COMPOSE button to create your first post.";
const contactContent = "If you have any queries related to anything just get in touch with us on: Facebook, Instagram or on Twitter.We will try to resolve your queries as soon as possible.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const URL = process.env.MONGO_URL;


//connecting mongoose with database mongodb
mongoose.connect(URL, {useNewUrlParser: true,  useUnifiedTopology: true , useFindAndModify: false });
let posts = [];
const blogSchema ={
   title:String,
   content:String
}

const Post = mongoose.model('post',blogSchema);

app.get("/",function(req, res){
  Post.find({}, function(err, posts){
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
      });
  });

});

app.get("/compose",function(req, res){
  res.render('compose',{txt:null,txtarea:null});
});
app.get("/contact",function(req, res){
  res.render("contact",{contactContent});
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
  var id = "";
  Post.find({title:requestedURL}, function(err, result) {
    if(err)
    console.log(err);
    else
    {
       id = result[0]._id;
       res.render("compose",{txtarea:result[0].content, txt:requestedURL});  
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
      if(err) return handleError(err);
    });
    res.redirect("/");

  });
//DELETE A DOCUMENT
app.post("/post/:topic",function(req, res)
{
   
   const delItem = req.params.topic;
    Post.deleteOne({title:delItem},function(err)
    {
      if(err) return handleError(err);
    });
    res.redirect("/");
});
  
app.post("/compose",function(req, res){
  var userTitle = req.body.composeText;
  var userPost = req.body.content;
 

  const input = new Post({
    title:userTitle,
    content:userPost
  });
  posts.push(input);
    input.save();
  res.redirect("/");
  
});




app.listen(process.env.PORT || 3000, function() {
  console.log("Server started .");
});
