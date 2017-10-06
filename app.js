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
var bodyParser = require('body-parser');

var Conversation = require('watson-developer-cloud/conversation/v1'); // watson sdk
var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
var natural_language_understanding = new NaturalLanguageUnderstandingV1({
    'username': process.env.NLU_USERNAME,
    'password': process.env.NLU_PASSWORD,
    'version_date': '2017-02-27'
});
var Cloudant = require('./server/configs/cloudant').init;
var cloudant = require('./server/cloudant');

var AYLIENTextAPI = require('aylien_textapi'); //AYLIEN Text API
var textapi = new AYLIENTextAPI ({
  application_id: process.env.AYYLIENT_TEXTAPI_APP_ID || '',
  application_key: process.env.AYYLIENT_TEXTAPI_APP_KEY || ''
});

var app = express();

// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json());

// Create the service wrapper
var conversation = new Conversation({
  // If unspecified here, the CONVERSATION_USERNAME and CONVERSATION_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  // username: '<username>',
  // password: '<password>',
  // url: 'https://gateway.watsonplatform.net/conversation/api',
  version_date: Conversation.VERSION_DATE_2017_04_21
});

let weather = require('./server/weatherHandler');
let locationHandler = require('./server/locationHandler');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT");
    next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

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

app.post('/api/forecast/daily', function (req,res) {
    let geocode = [req.body.lat, req.body.lng];
    console.log(req.body, geocode);

    weather.weatherAPI("/api/weather/v1/geocode/" + geocode[0] + "/" + geocode[1] + "/forecast/daily/10day.json", {
        units: "m",
        language: "en"
    }, function (error, result) {
        if (error) {
            console.log(error);
            res.send(error).status(400);
        } else {
            console.log("10 days forecast");
            res.json(result);
        }
    });
});


// Endpoint to be call from the client side
app.post('/api/message', function(req, res) {

    let URL  = require('url');
    const url_parts = req.url;
    // let url_parts = url(req.url);
    console.log(url_parts);

  let agendarConversa = false;
  let weather = false;

  let workspace = process.env.WORKSPACE_ID || '<workspace-id>';
  if (!workspace || workspace === '<workspace-id>') {
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
      }
    });
  }
  let payload = {
    workspace_id: workspace,
    context: req.body.context || {},
    input: req.body.input || {}
  };

  console.log(payload);

  // Send the input to the conversation service
  conversation.message(payload, function(err, data) {
    if (err) {
      return res.status(err.code || 500).json(err);
    }

    if(data.intents[0]){
        if(data.intents[0].intent === 'agendarConversa'){
            agendarConversa = true;
            console.log("\nangendarConversa ", agendarConversa);
        } else if (data.intents[0].intent === 'weather') {
            weather = true;
            console.log("\nweather ", weather);
        }
    }

    if(agendarConversa && data.context.system.branch_exited === true && data.context.system.branch_exited_reason === 'completed'){

        let meeting_info = {
            username: data.context.username,
            usermail: data.context.usermail,
            userfone: data.context.userfone,
            meeting_date: data.context.meeting_date,
            meeting_time: data.context.meeting_time
        };

        console.log("\n--------------------------------\nDone\n");
        console.log(meeting_info);
        console.log("--------------------------------\n");



        cloudant(Cloudant, "chat").insertDoc(meeting_info).then(function (res) {
            console.log("Meeting info saved in Cloudant: ", res);
        }, function (error) {
            console.log("Cloudant error: ", error.error, error.reason);
            reject("Cloudant error: ", error.error, error.reason);
        });

        agendarConversa = false;
        return res.json(updateMessage(payload, data));
    }
    else if (weather) {

        // Exemplo de URL utilizada para obter a longitude e latitude do local informado
        //http://maps.googleapis.com/maps/api/geocode/json?address=s%C3%A3o%20paulo+FL&sensor=false
        let url = ["http://maps.googleapis.com/maps/api/geocode/json?address=", encodeURI(data.entities[0].value), "&sensor=false"].join("").toLowerCase();

        locationHandler.location(url).then(
            (response) => {
                data.output.text = response;
                weather = false;

                return res.json(updateMessage(payload, data));
            }
        );

    }
    else {
        return res.json(updateMessage(payload, data));
    }
  });
});

/**
 * Updates the response text using the intent confidence
 * @param  {Object} input The request to the Conversation service
 * @param  {Object} response The response from the Conversation service
 * @return {Object}          The response with the updated message
 */
function updateMessage(input, response) {
  var responseText = null;
  if (!response.output) {
    response.output = {};
  } else {
    return response;
  }
  if (response.intents && response.intents[0]) {
    let intent = response.intents[0];
    // Depending on the confidence of the response the app can return different messages.
    // The confidence will vary depending on how well the system is trained. The service will always try to assign
    // a class/intent to the input. If the confidence is low, then it suggests the service is unsure of the
    // user's intent . In these cases it is usually best to return a disambiguation message
    // ('I did not understand your intent, please rephrase your question', etc..)
    if (intent.confidence >= 0.75) {
      responseText = 'I understood your intent was ' + intent.intent;
    } else if (intent.confidence >= 0.5) {
      responseText = 'I think your intent was ' + intent.intent;
    } else {
      responseText = 'I did not understand your intent';
    }
  }
  response.output.text = responseText;
  return response;
}

module.exports = app;
