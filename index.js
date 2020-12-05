const express = require("express");
const app = express();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fetch = require("node-fetch");

app.use(cookieParser());
app.use(morgan("combined"));
app.use(bodyParser.raw({ type: "*/*" }));
app.use(cors());
app.use(express.static("public"));

//username and password
let database = new Map();
//token and the username
let userToken = new Map();
//user token and create channel name
let tokenNewChannelName = new Map();
//channel name and its users
let channelUsers = new Map();
let channelMessage = new Map();

let token1 = ["unique", "awesome", "pure", "graceful", "perpetual"]
let token2 = ["rocky", "lush", "wavy", "decorous", "rightful"]
let token3 = ["wilderness", "rainbow", "leaves", "forest", "meadow"]

let counter = 123;

app.get("/sourcecode", (req, res) => {
    res.send(require("fs").readFileSync(__filename).toString());
});

app.post("/signup", (req, res) => {
    let parsed = JSON.parse(req.body);
    let username = parsed.username;
    let password = parsed.password;

    if (database.has(username)) {
        res.send(JSON.stringify({ "success": false, "reason": "Username exists" }));
    }
    if (username === undefined) {
        res.send(JSON.stringify({ "success": false, "reason": "username field missing" }));
    }
    if (password === undefined) {
        res.send(JSON.stringify({ "success": false, "reason": "password field missing" }));
    }
    database.set(username, password);
    res.send(JSON.stringify({ "success": true }));
});

app.post("/login", (req, res) => {
    let parsed = JSON.parse(req.body);
    let username = parsed.username;
    let password = parsed.password;
    let randomNum1 = Math.round(Math.random() * 4);
    let randomNum2 = Math.round(Math.random() * 4);
    let randomNum3 = Math.round(Math.random() * 4);

    let token = String(token1[randomNum1] + "-" + token2[randomNum2] + "-" + token3[randomNum3] + "-" + counter);
    counter++;

    if (username === undefined) {
        res.send(JSON.stringify({ "success": false, "reason": "username field missing" }))
    };
    if (!database.has(username)) {
        res.send(JSON.stringify({ "success": false, "reason": "User does not exist" }))
    };
    if (password === undefined) {
        res.send(JSON.stringify({ "success": false, "reason": "password field missing" }))
    };
    if (password != database.get(username)) {
        res.send(JSON.stringify({ "success": false, "reason": "Invalid password" }))
    };

    if (database.has(username)) {
        userToken.set(token, username);
    }
    res.send(JSON.stringify({ "success": true, "token": token }))
});

app.post("/create-channel", (req, res) => {
    let parsed = JSON.parse(req.body);
    let token = req.header("token");
    let channelName = parsed.channelName;
    let channelCreatorName = userToken.get(token);

    if (token === undefined) {
        res.send({ "success": false, "reason": "token field missing" })
    }
    if (!userToken.has(token)) {
        res.send({ "success": false, "reason": "Invalid token" })
    }
    if (channelName === undefined) {
        res.send({ "success": false, "reason": "channelName field missing" })
    }
    if (channelUsers.has(channelName)) {
        res.send({ "success": false, "reason": "Channel already exists" })
    }
    tokenNewChannelName.set(token, channelName);

    channelUsers.set(channelName, { "join": [], "ban": [] });
    let channel = tokenNewChannelName.get(token);
    channelMessage.set(channelName, []);
    let arrays = channelUsers.get(channelName);
    let join = arrays.join;
    join.push(token);
    res.send(JSON.stringify({ "success": true, "channel": channel, "channelUsers ": channelUsers.get(channelName) }));
});

app.post("/join-channel", (req, res) => {
    let parsed = JSON.parse(req.body);
    let token = req.header("token");
    let channelName = parsed.channelName;

    if (token === undefined) {
        res.send({ "success": false, "reason": "token field missing" })
    }
    if (!userToken.has(token)) {
        res.send({ "success": false, "reason": "Invalid token" })
    }
    if (channelName === undefined) {
        res.send({ "success": false, "reason": "channelName field missing" })
    }
    if (!channelUsers.has(channelName)) {
        res.send({ "success": false, "reason": "Channel does not exist" })
    }
    let arrays = channelUsers.get(channelName);
    let join = arrays.join;
    let ban = arrays.ban;
    let bool = false;

    for (let i = 0; i < ban.length; i++) {
        if (ban[i] === token) {
            bool = true;
            res.send({ "success": false, "reason": "User is banned" })
        }
    }
    for (let i = 0; i < join.length; i++) {
        if (join[i] === token) {
            bool = true;
            res.send({ "success": false, "reason": "User has already joined" })
        }
    }

    if (bool === false) {
        join.push(token);
    }

    res.send(JSON.stringify({ "success": true, "join": join }));
});

app.post("/leave-channel", (req, res) => {
    let parsed = JSON.parse(req.body);
    let token = req.header("token");
    let channelName = parsed.channelName;

    if (token === undefined) {
        res.send({ "success": false, "reason": "token field missing" })
    }
    if (!userToken.has(token)) {
        res.send({ "success": false, "reason": "Invalid token" })
    }
    if (channelName === undefined) {
        res.send({ "success": false, "reason": "channelName field missing" })
    }
    if (!channelUsers.has(channelName)) {
        res.send({ "success": false, "reason": "Channel does not exist" })
    }

    let arrays = channelUsers.get(channelName);
    let join = arrays.join;
    let isTrue = false;

    for (let i = 0; i < join.length; i++) {
        if (join[i] === token) {
            isTrue = true;
            break;
        }
    }
    if (isTrue === false) {
        res.send({ "success": false, "reason": "User is not part of this channel" })
    }

    let number;
    for (let i = 0; i < join.length; i++) {
        if (join[i] === token) {
            number = i;
        }
    }

    join.splice(number, number);
    res.send(JSON.stringify({ "success": true, "join array": join }));
})

app.get("/joined", (req, res) => {
    let parsed = JSON.parse(req.body);
    let token = req.header("token");
    let channelOfInterest = req.query.channelName;

    if (!channelUsers.has(channelOfInterest)) {
        res.send({ "success": false, "reason": "Channel does not exist" })
    }
    if (token === undefined) {
        res.send({ "success": false, "reason": "token field missing" })
    }

    let arrays = channelUsers.get(channelOfInterest);
    let join = arrays.join;
    let isTrue = false;

    for (let i = 0; i < join.length; i++) {
        if (join[i] === token) {
            isTrue = true;
            break;
        }
    }
    if (isTrue === false) {
        res.send({ "success": false, "reason": "User is not part of this channel" })
    }

    res.send(JSON.stringify({ "success": true, "joined": join }));
})

app.post("/delete", (req, res) => {
    let token = req.header("token");
    let parsed = JSON.parse(req.body);
    let channelName = parsed.channelName;

    if (token === undefined) {
        res.send({ "success": false, "reason": "token field missing" })
    }
    if (!userToken.has(token)) {
        res.send({ "success": false, "reason": "Invalid token" })
    }
    if (channelName === undefined) {
        res.send({ "success": false, "reason": "channelName field missing" })
    }
    if (!channelUsers.has(channelName)) {
        res.send({ "success": false, "reason": "Channel does not exist" })
    }
    if (tokenNewChannelName.has(token)) {
        if (tokenNewChannelName.get(token) === channelName) {
            tokenNewChannelName.delete(channelName);
            channelUsers.delete(channelName);
        }
    }
    res.send({ "success": true })
})

app.post("/kick", (req, res) => {
    let token = req.header("token");
    let parsed = JSON.parse(req.body);
    let channelName = parsed.channelName;
    let target = parsed.target;

    if (token === undefined) {
        res.send({ "success": false, "reason": "token field missing" })
    }
    if (!userToken.has(token)) {
        res.send({ "success": false, "reason": "Invalid token" })
    }
    if (channelName === undefined) {
        res.send({ "success": false, "reason": "channelName field missing" })
    }
    if (target === undefined) {
        res.send({ "success": false, "reason": "target field missing" })
    }

    let expectedChannel = tokenNewChannelName.get(token);
    if (expectedChannel !== undefined) {
        if (expectedChannel !== channelName) {
            res.send({ "success": false, "reason": "Channel not owned by user" })
        }
        if (expectedChannel === channelName) {
            let channel = channelUsers.get(channelName);
            let join = channel.join;
            join.remove(target);
        }
    }

    res.send({ "success": true })
})

app.post("/ban", (req, res) => {
    let token = req.header("token");
    let parsed = JSON.parse(req.body);
    let channelOfInterest = parsed.channelName;
    let target = parsed.target;

    if (token === undefined) {
        res.send({ "success": false, "reason": "token field missing" })
    }
    if (!userToken.has(token)) {
        res.send({ "success": false, "reason": "Invalid token" })
    }
    if (channelOfInterest === undefined) {
        res.send({ "success": false, "reason": "channelName field missing" })
    }
    if (target === undefined) {
        res.send({ "success": false, "reason": "target field missing" })
    }
    let expectedChannel = tokenNewChannelName.get(token);
    if (expectedChannel !== undefined) {
        if (expectedChannel !== channelOfInterest) {
            res.send({ "success": false, "reason": "Channel not owned by user" })
        }
    }

    if (expectedChannel === channelOfInterest) {
        let arrays = channelUsers.get(channelOfInterest);
        let ban = arrays.ban;
        ban.push(token);
    }
    res.send({ "success": true })
})

app.post("/message", (req, res) => {
    let token = req.header("token");
    let parsed = JSON.parse(req.body);
    let channelOfInterest = parsed.channelName;
    let contents = parsed.contents;

    if (token === undefined) {
        res.send({ "success": false, "reason": "token field missing" })
    }
    if (!userToken.has(token)) {
        res.send({ "success": false, "reason": "Invalid token" })
    }
    if (channelOfInterest === undefined) {
        res.send({ "success": false, "reason": "channelName field missing" })
    }
    if (contents === undefined) {
        res.send({ "success": false, "reason": "contents field missing" })
    }

    let arrays = channelUsers.get(channelOfInterest);
    let join = arrays.join;
    let isTrue = false;

    for (let i = 0; i < join.length; i++) {
        if (join[i] === token) {
            isTrue = true;
            break;
        }
    }

    if (isTrue === false) {
        res.send({ "success": false, "reason": "User is not part of this channel" })
    }

    //userToken
    let channel = channelMessage.get(channelOfInterest);
    channel.push({ token, contents });

    res.send({ "success": true })
})

app.get("/messages", (req, res) => {
    let token = req.header("token");
    let channelName = req.query.channelName;

    if (channelName === undefined) {
        res.send({ "success": false, "reason": "channelName field is missing" })
    }
    if (!channelMessage.has(channelName)) {
        res.send({ "success": false, "reason": "Channel does not exist" })
    }

    let arrays = channelUsers.get(channelName);
    let join = arrays.join;
    let isTrue = false;

    for (let i = 0; i < join.length; i++) {
        if (join[i] === token) {
            isTrue = true;
            break;
        }
    }
    if (isTrue === false) {
        res.send({ "success": false, "reason": "User is not part of this channel" })
    }

    res.send({ "success": true, "messages": channelMessage.get(channelName) })
})

app.listen(process.env.PORT || 3000);