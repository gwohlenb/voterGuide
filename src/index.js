/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * Examples:
 *
 * One-shot model:
 *  User: "Alexa ask voterguide how I should vote on Measure K"
 *  Alexa: "(Measure K recommendation)"
 *
 * Dialog model:
 *  User:  "Alexa open voterguide"
 *  Alexa: "Welcome to the Voter Guide.  Do you want guidance on Measure K or Measure AA?"
 *  User:  "Measure AA"
 *  Alexa: (Measure AA recommendation)
 *  Alexa: "Is there another measure you'd like guidance on?"
 *  User:  "alexa K"
 * Alexa:  (Measure K recommendation)
 * Alexa:  "Is there another measure you'd like guidance on?"
 * Alexa:  "alexa zz"
 * Alexa:  "I'm sorry, I currently do not have any guidance for measure zz"
 * Alexa:  "Is there another measure you'd like guidance on?"
 *  User:  "alexa stop"
 */

'use strict';

/**
 * App ID for the skill
 */
var APP_ID = "amzn1.echo-sdk-ams.app.d85990a1-1ed6-439c-9bce-905903dd5c0d";

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill'),
       answers = require('./answers');

/**
 * VoterGuideHelper is a child of AlexaSkill.
 */
 
var VoterGuideHelper = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill

VoterGuideHelper.prototype = Object.create(AlexaSkill.prototype);
VoterGuideHelper.prototype.constructor = VoterGuideHelper;

// Override AlexaSkill request and intent handlers

// Session start handler

VoterGuideHelper.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

// Launch handler

VoterGuideHelper.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    handleWelcomeRequest(response);
};

// Session end handler

VoterGuideHelper.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

/**
 * override intentHandlers to map intent handling functions.
 */

VoterGuideHelper.prototype.intentHandlers = {
    "OneshotVoterGuideIntent": function (intent, session, response) {
        handleOneshotVoterGuideRequest(intent, session, response);
    },

    "DialogVoterGuideIntent": function (intent, session, response) {
        // We could be passed a slot with a value, no slot, or a slot with no value.
        var measureSlot = intent.slots.MeasureDialog;
        if (measureSlot && measureSlot.value) {
            handleVoterGuideDialogRequest(intent, session, response);
        } else {
            handleNoSlotDialogRequest(intent, session, response);
        }
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        handleHelpRequest(response);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    }
};

// Welcome request function

function handleWelcomeRequest(response) {
    var speechOutput = {
            speech: "Welcome to the Voter Guide.  Do you want guidance on Measure K or Measure AA?",
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        },
        repromptOutput = {
            speech: "Do you want guidance on Measure K or Measure AA?",
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };

    // keep the session open and ask for a measure
    response.ask(speechOutput, repromptOutput);
}

// Help request function

function handleHelpRequest(response) {
    var speechOutput = { 
            speech: "Do you want guidance on Measure K or Measure AA? " + "Or you can say exit.",
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };      

    // keep the session open and ask for a measure (or to exit)
    response.ask(speechOutput, speechOutput);
}

// Dialog request function

function handleVoterGuideDialogRequest(intent, session, response) {

    var measureSlot = intent.slots.MeasureDialog;
    var measureName;

    if (measureSlot && measureSlot.value) {
        measureName = measureSlot.value.toLowerCase();
    }

    var cardTitle = "Guidance for measure " + measureSlot.value,
        answer = answers[measureName],
        speechOutput,
        repromptOutput;
    
    console.log(measureName); 
    console.log(answer);     
    if (measureName == "k" || measureName == "aa") {
        speechOutput = {
            speech: "<speak>" + 
                      answer + 
                      "<s>Is there another measure you'd like guidance on?</s>" +
                    "</speak>",
            type: AlexaSkill.speechOutputType.SSML
        };

    // keep the session open and provide the single guidance the user requested
        response.askWithCard(speechOutput, cardTitle, answer);
    } 
    else {
        if (measureName) {
            speechOutput = {
                speech: "I'm sorry, I currently do not have any guidance for measure " + measureName,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
        }
        else {
            speechOutput = {
                speech: "I'm sorry, I currently do not know that measure.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
        }
        // keep the session open and ask the user if there is another measure they want guidance on.
        response.tellWithCard(speechOutput, cardTitle, measureName);
    }
}

// No slot dialog request function

function handleNoSlotDialogRequest(intent, session, response) {
   var speechOutput = "The slot was empty.  Goodbye.";
   response.tell(speechOutput);
}

// One shot request function

function handleOneshotVoterGuideRequest(intent, session, response) {

    var measureSlot = intent.slots.MeasureOneshot;
    var measureName;

    if (measureSlot && measureSlot.value) {
        measureName = measureSlot.value.toLowerCase();
    }
    
    var cardTitle = "Guidance for measure " + measureSlot.value,
        answer = answers[measureName],
        speechOutput,
        repromptOutput;
    
    console.log(measureName); 
    console.log(answer);     
    if (measureName == "k" || measureName == "aa") {
        speechOutput = {
            speech: answer,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tellWithCard(speechOutput, cardTitle, answer);
    }
    else {
        if (measureName) {
            speechOutput = {
                speech: "I'm sorry, I currently do not have any guidance for measure " + measureName,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
        }
        else {
            speechOutput = {
                speech: "I'm sorry, I currently do not know that measure.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
        }
        response.tellWithCard(speechOutput, cardTitle, measureName);
    } 
}

// Export the handler that responds to the Alexa requests.

exports.handler = function (event, context) {
    var voterguideHelper = new VoterGuideHelper();
    voterguideHelper.execute(event, context);
};
