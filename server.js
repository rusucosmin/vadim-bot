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

offers = {
  "economica2": {
    ref: "economica2",
    offer: "pizza",
    type: "big pizza",
    price: "very cheap, bug high quality",
    message: "You should try our pizza, best pizza in town. Only today at a great deal 50% off on two ordered"
  }, "loomni": {
    ref: "loomni",
    offer: "buritto",
    type: "buritto with every ingredient you can ever think",
    price: "very cheap, bug high quality",
    message: "There is nothing more that should be said."
  }
}

app.get("/offers", function(req, res) {
  ref = req.query.ref
  console.log(req.query)
  offer = offers[ref]
  console.log(ref)
  if (!offer) {
    offer = {
      ref,
      error: "unrecognised ref"
    }
  }
  res.send(offer)
})

app.post("/offers", function(req, res) {
  console.log("post offer")
  console.log(req.body)
  ref = req.body.ref
  offer = req.body.offer
  type = req.body.type
  price = req.body.price
  message = req.body.message
  offers[ref] = {
    ref,
    offer,
    type,
    price,
    message
  }
  res.send(offers)
})

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
    sendMessage(senderId, {text: "Hi there, it looks like you are at " + event.referral.ref})
    sendMessage(senderId, {text: "Here are our offers today"})
    request({
      url: "/offers?ref=" + event.referral.ref,
      method: "GET"
    }, function(err, response, body) {
      var offer = JSON.parse(body)
      sendMessage(senderId, {
        text: "Our offfer today is:\n"
            + offer.offer + "\n"
            + offer.price + "\n"
            + offer.message + "\n"
            + offer.price + "\n"
      })
    })
    sendMessage(senderId,  {text: "Here are our offers today"})
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
