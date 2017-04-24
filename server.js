var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.listen((process.env.PORT || 5000));

app.get("/", function(req, res) {
  res.send("Deployed!");
});


app.get("/webhook", function(req, res) {
  if(req.query["hub.verify_token"] == process.env.VERIFICATION_TOKEN) {
    console.log("Verified webhook");
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Verification failed. The tokens do not mathc");
    res.sendStatus(403);
  }
});

app.post("/webhook", function(req, res) {
  if(req.body.object === "page") {
    req.body.entry.forEach(function(entry) {
      entry.messaging.forEach(function(event) {
        if(event.postback) {
          processPostback(event);
        }
     });
    });
    res.sendStatus(200);
  }
});

function processPostback(event) {
  var senderId = event.sender.id;
  var payload = event.postback.payload;

  if(payload === "Greeting") {
    request({
      url: "https://graph.facebook.com/v2.6/" + senderId,
      qs: {
        access_token: process.env.PAGE_ACCESS_TOKEN,
        fields: "first_name"
      },
      method: "GET"
    }, function(error, response, body) {
      var greeting = "";
      if(error) {
        console.log("Error getting user's name: " + error);
      } else {
        var bodyObj = JSON.parse(body);
        name = bodyObj.first_name;
        greeting = "Salutări " + name + ". ";
      }
      var message = greeting + "Politica e arta de a sta la pândă.";
      sendMessage(senderId, {text: message});
    });
  }
  else {
    sendMessage(senderId, {text: "Taci, fă, analfabeto, că vorbesc nişte intelectuali!"});
  }
}

function sendMessage(recipientId, message) {
  request({
    url: "https://graph.facebook.com/v2.6/me/messages",
    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
    method: "POST",
    json: {
      recipient: {id: recipientId},
      message: message
    }
  }, function(error, response, body) {
    if(error) {
      console.log("Error sending message: " + error);
    }
  });
}
