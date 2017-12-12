var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
var fs = require('fs');

var quotes = fs.readFileSync('vadim.txt', 'utf8').split("\n");
console.log("Loaded:\n" + quotes.join("\n"));

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
    console.error("Verification failed. The tokens do not match");
    res.sendStatus(403);
  }
});

app.post("/webhook", function(req, res) {
  console.log("Started request")
  console.log(req)
  if(req.body.object === "page") {
    req.body.entry.forEach(function(entry) {
      entry.messaging.forEach(function(event) {
        if(event.postback) {
          processPostback(event);
        } else if(event.message) {
          processMessage(event);
        } else if(event.referral) {
          processReferral(event);
        }
     });
    });
    res.sendStatus(200);
  }
});

function processReferral(event) {
  console.log("processReferral");
  console.log(event)
  var senderId = event.sender.id;

  if(event.referral.source == "MESSENGER_CODE") {
    sendMessage(senderId, {text: "Hi there, it looks like you are at" + event.referral.ref})
  } else {
    sendMessage(senderId, {text: "Hi there, stranger"})
  }
}

function processPostback(event) {
  console.log("processPostback");
  console.log(event)

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
  } else if(event.postback.referral) {
    var ref = event.postback.referral
    // first time entering
    if (ref.source === "MESSENGER_CODE") {
      sendMessage(senderId, {text: "hi there. It looks like you were referenced by " + ref.ref})
    } else {
      sendMessage(senderId, {text: "oh, you didn't come from parametric code. Nice to meet you!"})
    }
  }
}

function processMessage(event) {
  console.log("processMessage");
  console.log(event)

  if(!event.message.is_echo) {
    var message = event.message;
    var senderId = event.sender.id;

    console.log("Received message from senderId: " + senderId);
    console.log("Message is: " + JSON.stringify(message));

    var vadim = quotes[Math.floor(Math.random()*quotes.length)];
    sendMessage(senderId, {text: vadim});
  }
}

function sendMessage(recipientId, message) {
  console.log("sending Message ")
  console.log(message)
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
