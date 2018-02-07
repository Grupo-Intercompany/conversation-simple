/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

require('dotenv').config({silent: true});

var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var request = require('request');
var cookieParser = require('cookie-parser');

var Cloudant = require('./server/configs/cloudant').init;
var cloudant = require('./server/cloudant');

var app = express();

// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json());


let uidGenerator = require('./server/uidGenerator');


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT");
    next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


app.get("/teste", function (req, res) {
  return res.status(200).send("Foi");
});

app.get("/env", function (req, res) {
    return res.status(200).send(process.env);
});

app.get("/vcap", function (req, res) {
    return res.status(200).send(JSON.parse(process.env.VCAP_SERVICES));
});

app.get("/cloudant", function (req, res) {
    cloudant(Cloudant, "chat").getAllDocs().then(
        res.send.bind(res)
    );
});


// Endpoint to be call from the client side
app.post('/api/message', function(req, res) {

  let payload = {
    user : "",
    text: "",
    instance: "intercompany"
  };

  if(req.body.user){
    payload.user = req.body.user;
  } else {
    payload.user = uidGenerator.generateUniqueId();
  }

  if(req.body.text){
    payload.text = req.body.text;
  } else {
    payload.text = "Oi";
  }

  console.log(payload);

  let options = {
    method: 'POST',
    url: 'http://iris-messenger.mybluemix.net/chat',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    json: true
  };

  request(options, function (error, response, body) {
    if (error) {
      res.send(error);
      throw new Error(error);
    }


    let payloadResponse = {
      text: body,
      user: payload.user
      /*output: {
        text: payload,
        user: user
      }*/
    };

    console.log("request");
    console.log(payloadResponse);

    res.send(payloadResponse);
  });

});

module.exports = app;
