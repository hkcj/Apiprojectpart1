const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");

app.use(morgan("combined"));
app.use(bodyParser.raw({type:"*/*"}));
app.use(cors());
app.use(express.static("public"));

//express, body-parser, cors, fs and morgan
//username and password
let database = new Map();
//token and the username
let userToken = new Map();
//user token and create channel name
let tokenNewChannelName = new Map();
//channel name and its users
let channelUsers = new Map();
let channelMessage = new Map();

let token1 = ["unique","awesome","pure","graceful","perpetual"]
let token2 = ["rocky","lush","wavy", "decorous","rightful"]
let token3 = ["wilderness","rainbow","leaves","forest","meadow"]

let counter = 123;

app.get("/sourcecode", (req, res) => {
  res.send(require('fs').readFileSync(__filename).toString());
});

app.get("/", (req, res) => {
  res.send("hello world");
});

app.post("/signup", (req, res) => {
   let parsed = JSON.parse(req.body);
   let username = parsed.username;
   let password = parsed.password;
  
   if(username === undefined){
    res.send(JSON.stringify({"success": false, "reason":"username field missing"}));
  }
  if(database.has(username)){
  res.send(JSON.stringify({"success": false, "reason": "Username exists"}));
  }
 
  if(password === undefined){
    res.send(JSON.stringify({"success": false, "reason":"password field missing"}));
  }
  database.set(username, password);
 res.send(JSON.stringify({"success":true}));
});


app.post("/login", (req, res) => {
 let parsed = JSON.parse(req.body);
 let username = parsed.username;
 let password = parsed.password;
 let randomNum1 = Math.round(Math.random()*4);
 let randomNum2 = Math.round(Math.random()*4);
 let randomNum3 = Math.round(Math.random()*4);
  
 let token = String(token1[randomNum1] + "-"+ token2[randomNum2] + "-" + token3[randomNum3] + "-" + counter);
  counter++;
  
  if(username === undefined){
    res.send(JSON.stringify({"success":false, "reason": "username field missing"}))
  };
  if(!database.has(username)){
    res.send(JSON.stringify({"success":false, "reason":"User does not exist"}))
  };
  if(password === undefined){
    res.send(JSON.stringify({"success": false, "reason":"password field missing"}))
  };
  if(password != database.get(username)){
    res.send(JSON.stringify({"success":false, "reason":"Invalid password"}))
  };
  
  if(database.has(username)){
    userToken.set(token, username);
  }
  res.send(JSON.stringify({"success": true, "token": token}))
});

app.post("/create-channel", (req, res) => {        
let parsed = JSON.parse(req.body);
let token = req.header("token");
let channelName = parsed.channelName;
let channelCreatorName = userToken.get(token);
let bool = false;
  
  if(token === undefined){
    bool = true;
    res.send({"success": false, "reason":"token field missing"})
  }
  if(!userToken.has(token)){
    bool = true;
    res.send({"success": false, "reason":"Invalid token"})
  }
  if(channelName === undefined){
    bool = true
    res.send({"success":false, "reason":"channelName field missing"})
  }
  if(channelUsers.has(channelName)){
    bool = true;
    res.send({"success": false, "reason":"Channel already exists"})
  } 
  
  if(bool === false){
  tokenNewChannelName.set(token,channelName);
  channelUsers.set(channelName,{"join":[], "ban":[] });
  let channel = tokenNewChannelName.get(token);
  channelMessage.set(channelName,[]);
  // let arrays = channelUsers.get(channelName);
  // let join = arrays.join;
  // join.push(token);
  res.send(JSON.stringify({"success": true}));
  }
});

app.post("/join-channel", (req, res)=>{
let parsed = JSON.parse(req.body);
let token = req.header("token");
let channelName = parsed.channelName;
let username = userToken.get(token);
  
  if(token === undefined){
    res.send({"success": false, "reason":"token field missing"})
  }
  if(!userToken.has(token)){
    res.send({"success": false, "reason":"Invalid token"})
  }
  if(channelName === undefined){
    res.send({"success": false, "reason":"channelName field missing"})
  }
  if(!channelUsers.has(channelName)){
    res.send({"success": false, "reason":"Channel does not exist"})
  }
  let arrays = channelUsers.get(channelName);
  let join = arrays.join;
  let ban = arrays.ban;
  let bool = false;
  
  for(let i = 0 ; i < ban.length ; i++){
   if(ban[i] === username){
     bool = true;
     res.send({"success": false,"reason":"User is banned"})
    }
  }
  for(let i = 0 ; i < join.length ; i++){
    if(join[i] === username){
      bool = true;
      res.send({"success": false, "reason":"User has already joined"})
    }
  }
  
if(bool === false){
      join.push(username);
}
  
  res.send(JSON.stringify({"success": true}));
});

app.post("/leave-channel", (req, res) =>{
  let parsed = JSON.parse(req.body);
  let token = req.header("token");
  let channelName = parsed.channelName;
  let username = userToken.get(token);
  
  if(token === undefined){
    res.send({"success": false, "reason": "token field missing"})
  }
  if(!userToken.has(token)){
    res.send({"success": false, "reason":"Invalid token"})
  }
  if(channelName === undefined){
    res.send({"success": false, "reason":"channelName field missing"})
  }
  if(!channelUsers.has(channelName)){
    res.send({"success": false, "reason":"Channel does not exist"})
  }
  
  let arrays = channelUsers.get(channelName);
  let join = arrays.join;
  let isTrue = false;
  
  for(let i = 0 ; i < join.length ; i++){
    if(join[i] === username){ 
      isTrue = true;
      break;
    }
  }
  
  if(isTrue === false){
     res.send({"success": false, "reason":"User is not part of this channel"})
  }
  
  if(isTrue === true){
  let number;
  for(let i = 0 ; i < join.length ; i++){
    if(join[i] === username){
      number = i;
    }
  }
  join.splice(number,1);
  res.send(JSON.stringify({"success":true}));
  }
  
})

app.get("/joined", (req, res)=>{
  let token = req.header("token");
  let channelOfInterest = req.query.channelName;
  let username = userToken.get(token);
  
  
  if(!channelUsers.has(channelOfInterest)){
    res.send({"success": false, "reason":"Channel does not exist"})
  }
  
   if(token === undefined){
    res.send({"success": false, "reason":"token field missing"})
  }
  
  if(!userToken.has(token)){
    res.send({"success": false, "reason":"Invalid token"})
  }
  
  let arrays = channelUsers.get(channelOfInterest);
  let join = arrays.join;
  let isTrue = false;
  
  for(let i = 0 ; i < join.length ; i++){
    if(join[i] === username){ 
      isTrue = true;
      break;
    }
  }
  if(isTrue === false){
     res.send({"success": false, "reason":"User is not part of this channel"})
  }
  
  res.send(JSON.stringify({"success": true,"joined": join }));
})

app.post("/delete", (req, res)=>{
  let token = req.header("token");
  let parsed = JSON.parse(req.body);
  let channelName = parsed.channelName;
  
  if(token === undefined){
    res.send({"success": false, "reason":"token field missing"})
  }
  if(!userToken.has(token)){
    res.send({"success": false, "reason":"Invalid token"})
  }
   if(channelName === undefined){
    res.send({"success": false, "reason":"channelName field missing"})
  }
  if(!channelUsers.has(channelName)){
    res.send({"success": false, "reason":"Channel does not exist"})
  }
  if(tokenNewChannelName.has(token)){
    if(tokenNewChannelName.get(token) === channelName){
       tokenNewChannelName.delete(channelName);
       channelUsers.delete(channelName);
    }
  }
  res.send({"success": true})
})

app.post("/kick", (req, res)=>{
  let token = req.header("token");
  let parsed = JSON.parse(req.body);
  let channelName = parsed.channelName;
  let target = parsed.target;
  let expectedChannel = tokenNewChannelName.get(token);
    let bool = true; 
  
  if(token === undefined){
    bool = false;
    res.send({"success": false, "reason":"token field missing"})
  }
  if(!userToken.has(token)){
    bool = false;
    res.send({"success": false, "reason":"Invalid token"})
  }
   if(channelName === undefined){
     bool = false;
    res.send({"success": false, "reason":"channelName field missing"})
  }
  if(target === undefined){
    bool = false;
     res.send({"success": false, "reason":"target field missing"})
  }
  let channel = channelUsers.get(channelName);
  let join = channel.join; 

  
  if(expectedChannel === undefined || expectedChannel !== channelName){
    bool = false;
      res.send({"success":false, "reason":"Channel not owned by user"})
    }   
  
  if(bool === true){
    if(expectedChannel === channelName){
       let number;
        for(let i = 0 ; i < join.length ; i++){
        if(join[i] === target){
          number = i;
        }
        }
      join.splice(number,1);
    }
    }
   res.send({"success": true})
})

app.post("/ban", (req, res)=>{
  let token = req.header("token");
  let parsed = JSON.parse(req.body);
  let channelName = parsed.channelName;
  let target = parsed.target;
  
  if(token === undefined){
    res.send({"success": false, "reason":"token field missing"})
  }
  if(!userToken.has(token)){
    res.send({"success": false, "reason":"Invalid token"})
  }
  if(channelName === undefined){
    res.send({"success": false, "reason":"channelName field missing"})
  }
  if(target === undefined){
     res.send({"success": false, "reason":"target field missing"})
  }
  let expectedChannel = tokenNewChannelName.get(token);
  
   if(expectedChannel === undefined || expectedChannel !== channelName){
      res.send({"success":false,"reason":"Channel not owned by user"})
    }
  
  let arrays = channelUsers.get(channelName);
  let ban = arrays.ban;
  if(expectedChannel === channelName){
  ban.push(target);
  }
  res.send({"success": true})
})

app.post("/message", (req, res)=>{
  let token = req.header("token");
  let parsed = JSON.parse(req.body);
  let channelName = parsed.channelName;
  let contents = parsed.contents;
   let username = userToken.get(token);
  
  if(token === undefined){
    res.send({"success": false, "reason":"token field missing"})
  }
  if(!userToken.has(token)){
    res.send({"success": false, "reason":"Invalid token"})
  }
   if(channelName === undefined){
    res.send({"success": false, "reason":"channelName field missing"})
  }
  if(contents === undefined){
    res.send({"success": false, "reason":"contents field missing"})
  }
  //  if(!channelMessage.has(channelName)){
  //   res.send({"success": false, "reason": "Channel does not exist"})
  // }
  
  
  let channel = channelUsers.get(channelName);
  if(channel !== undefined){
  let join= channel.join;

  let isTrue = false;
  
  for(let i = 0 ; i < join.length ; i++){
    if(join[i] === username){ 
      isTrue = true;
      break;
    }
  }
  if(isTrue === false){
     res.send({"success": false, "reason":"User is not part of this channel", "join": channelName, "username": channelUsers})
  }
  
  }
  
  let msgchannel = channelMessage.get(channelName);
  msgchannel.push(contents);
  res.send(JSON.stringify({"success": true}));
  
  
})

app.get("/messages", (req, res)=>{
  let token = req.header("token");
  let channelName = req.query.channelName;
  
  if(channelName === undefined){
    res.send({"success": false, "reason":"channelName field is missing"})
  }
  if(!channelMessage.has(channelName)){
    res.send({"success": false, "reason": "Channel does not exist"})
  }
  
  let arrays = channelUsers.get(channelName);
  let join = arrays.join;
  let isTrue = false;
  
  for(let i = 0 ; i < join.length ; i++){
    if(join[i] === token){ 
      isTrue = true;
      break;
    }
  }
  if(isTrue === false){
     res.send({"success": false, "reason":"User is not part of this channel"})
  }
  
  res.send({"success": true, "messages":channelMessage.get(channelName)})
})

app.get("/sourcecode", (req, res) => {
res.send(require("fs").readFileSync(__filename).toString());
});
    


app.listen(process.env.PORT || 3000);
