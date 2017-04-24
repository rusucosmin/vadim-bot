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
