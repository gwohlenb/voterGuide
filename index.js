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
 *   User: "Alexa ask voter guider how to vote on measure K" (question style)
 *  Alexa: "(Measure K recommendation)" 
 *   User: "Alexa ask voter guider the guidance on measure K" (noun style)
 *  Alexa: "(Measure K recommendation)"
 *   User: "Alexa ask voter guider to guide me on measure K" (verb style)
 *  Alexa: "(Measure K recommendation)"
 *   User: "Alexa ask voter guider how to vote on measure zz" (invalid measure)
 *  Alexa: "I'm sorry, I currently do not have any voting guidance for measure ZZ" 
*   Alexa: "You can say measure K or measure AA and I will provide you voting guidance on that measure."
 * 
 *
 * Dialog model:
 *  User:  "Alexa open voter guider"
 * Alexa:  "Welcome to the Voter Guider.  You can say measure K or measure AA and I will provide you voting guidance on that measure.  Or you can say exit."
 *  User:  "Measure AA"
 * Alexa:  (Measure AA recommendation)
 *  User:  "Alexa Measure K"
 * Alexa:  (Measure K recommendation)
 * Alexa:  "You can say measure K or measure AA and I will provide you voting guidance on that measure.  Or you can say exit."
 *  User:  "Alexa stop"
 * 
 * Dialog model #2:
 *  User: "Alexa open voter guider and guide me on measure AA"
 * Alexa: (Measure AA recommendation) 
 * Alexa: "You can say measure K or measure AA and I will provide you voting guidance on that measure.  Or you can say exit."
 *  User: "exit"
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
        var speechOutput = "Goodbye from the voter guider";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {                     
        var speechOutput = "Goodbye from the voter guider";
        response.tell(speechOutput);
    }
};

// Welcome request function

function handleWelcomeRequest(response) {
    var speechOutput = {
            speech: "Welcome to the Voter Guider.  You can say measure K or measure AA and I will provide you voting guidance on that measure.  Or you can say exit.",
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        },
        repromptOutput = {
            speech: "You can say measure K or measure AA and I will provide you voting guidance on that measure.  Or you can say exit.",
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };

    // keep the session open and ask for a measure (or to exit)
    response.ask(speechOutput, repromptOutput);
}

// Help request function

function handleHelpRequest(response) {
    var speechOutput = { 
            speech: "I am here to help.  You can say measure K or measure AA and I will provide you voting guidance on that measure.  For example, you can say ask voter guider how to vote on measure K.  Or you can say exit.",
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };

    var repromptOutput = { 
            speech: "You can say measure K or measure AA and I will provide you voting guidance on that measure.  Or you can say exit.",
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };         

    // keep the session open and ask for a measure (or to exit)
    response.ask(speechOutput, repromptOutput);
}

// Dialog request function

function handleVoterGuideDialogRequest(intent, session, response) {

    var measureSlot = intent.slots.MeasureDialog;
    var measureName;

    if (measureSlot && measureSlot.value) {
        measureName = measureSlot.value.toLowerCase();
    } else {
        measureSlot.value = "";
    }

    var cardTitle = "Guidance for Measure " +  	  				   measureSlot.value.toUpperCase(),
        answer = answers[measureName],
        speechOutput,
        repromptOutput;

        repromptOutput = {
            speech: "You can say measure K or measure AA and I will provide you voting guidance on that measure.  Or you can say exit.",
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        }; 

    console.log('measureName = ' + measureName); 
    console.log('measureSlot.value = ' + measureSlot.value); 
    console.log('answer = ' + answer);     
    if (measureName == "k" || measureName == "aa") {
        speechOutput = {
            speech: "<speak>" + 
                      answer + 
                      "<s>You can say measure K or measure AA and I will provide you voting guidance on that measure.</s>" +
                      "<s>Or you can say exit.</s>" +
                    "</speak>",
            type: AlexaSkill.speechOutputType.SSML
        };

    // keep the session open and provide the single guidance the user requested
        response.askWithCard(speechOutput, repromptOutput, cardTitle, answer);
    } 
    else {
        if (measureName) {
            speechOutput = {
                speech: "I'm sorry, I currently do not have any voting guidance for Measure " + measureName.toUpperCase() + ".  You can say measure K or measure AA and I will provide you voting guidance on that measure.  Or you can say exit.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
        }
        else {
            speechOutput = {
                speech: "I'm sorry, I currently do not know that measure.  You can say measure K or measure AA and I will provide you voting guidance on that measure.  Or you can say exit.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
        }     

        // keep the session open and ask the user if there is another measure they want guidance on.
        response.askWithCard(speechOutput, repromptOutput, cardTitle, measureName);
    }
}

// No slot dialog request function

function handleNoSlotDialogRequest(intent, session, response) {
    var speechOutput = {
                speech: "I'm sorry, I currently do not know that measure.  You can say measure K or measure AA and I will provide you voting guidance on that measure.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
    // End the session.
    response.tell(speechOutput);
}

// One shot request function

function handleOneshotVoterGuideRequest(intent, session, response) {

    var measureSlot = intent.slots.MeasureOneshot;
    var measureName;

    if (measureSlot && measureSlot.value) {
        measureName = measureSlot.value.toLowerCase();
    } else {
        measureSlot.value = "";
    }
    
    var cardTitle = "Guidance for Measure " +              	  	   measureSlot.value.toUpperCase(),
        answer = answers[measureName],
        speechOutput,
        repromptOutput;
    
    console.log('measureName = ' + measureName); 
    console.log('measureSlot.value = ' + measureSlot.value); 
    console.log('answer = ' + answer);   
    if (measureName == "k" || measureName == "aa") {
        speechOutput = {
            speech: answer,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        // End the session.
        response.tellWithCard(speechOutput, cardTitle, answer);
    }
    else {
        if (measureName) {
            speechOutput = {
                speech: "I'm sorry, I currently do not have any voting guidance for measure " + measureName.toUpperCase() + ".  You can say measure K or measure AA and I will provide you voting guidance on that measure.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
        }
        else {
            speechOutput = {
                speech: "I'm sorry, I currently do not know that measure.  You can say measure K or measure AA and I will provide you voting guidance on that measure.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
        }

        // End the session.
        response.tellWithCard(speechOutput, cardTitle, measureName);
    } 
}

// Export the handler that responds to the Alexa requests.

exports.handler = function (event, context) {
    var voterguideHelper = new VoterGuideHelper();
    voterguideHelper.execute(event, context);
};
