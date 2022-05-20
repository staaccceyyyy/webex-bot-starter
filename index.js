//Webex Bot Starter - featuring the webex-node-bot-framework - https://www.npmjs.com/package/webex-node-bot-framework

// FRAMEWORK REQUIRES
var framework = require('webex-node-bot-framework');
var webhook = require('webex-node-bot-framework/webhook');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
app.use(express.static('images'));
const config = require("./config.json");

// MODEL REQUIRES
const Product = require('./models/Product'); //require classes
const Survey = require('./models/Survey');
const SurveyQuestions = require('./models/SurveyQuestions');
const Feedback = require('./models/Feedback');
const Agenda = require('./models/Agenda');

// INIT FRAMEWORK START
var framework = new framework(config);
framework.start();
console.log("Starting framework, please wait...");

framework.on("initialized", function () {
  console.log("framework is all fired up! [Press CTRL-C to quit]");
});

// A spawn event is generated when the framework finds a space with your bot in it
// If actorId is set, it means that user has just added your bot to a new space
// If not, the framework has discovered your bot in an existing space
framework.on('spawn', (bot, id, actorId) => {
  // When actorId is present it means someone added your bot got added to a new space
  // Lets find out more about them..
  var msg1 = 'what do you want to do today? You can say `mainmenu` to get the list of words I am able to respond to.';
  bot.webex.people.get(actorId).then((user) => {
    msg1 = `Hello there ${user.displayName}. ${msg}`
    console.log("here? no way");
  }
  ).catch((e) => {
    //console.error(`Failed to lookup user details in framwork.on("spawn"): ${e.message}`);
    msg1 = `Hello, ${msg1}`;
  })
    //.then(() => { notifications(bot) })
    .finally(() => {
      // Say hello, and tell users what you do!
      if (bot.isDirect) {
        bot.say('markdown', msg1);
      } else {
        let botName = bot.person.displayName;
        msg1 += `\n\nDon't forget, in order for me to see your messages in this group space, be sure to *@${botName}*.`;
        bot.say('markdown', msg1)
        //notifications(bot);
      }
    });

});
// INIT FRAMEWORK END

// FEATURES COMMANDS START (Process incoming messages)

let responded = false;
/* On mention with command
ex User enters @botname help, the bot will write back in markdown
*/
// menu summary of commands start
framework.hears(/help|what can i (do|say)|what (can|do) you do/i, function (bot, trigger) {
  console.log(`someone needs help! They asked ${trigger.text}`);
  responded = true;
  bot.say(`Hello ${trigger.person.displayName}.`)
    .then(() => sendHelp(bot))
    .catch((e) => console.error(`Problem in help hander: ${e.message}`));
});

framework.hears('mainmenu', function (bot, trigger) {
  console.log(`someone needs help! They asked ${trigger.text}`);
  responded = true;
  bot.say(`Hello ${trigger.person.displayName}.`)
    .then(() => mainmenu(bot))
    .catch((e) => console.error(`Problem in help hander: ${e.message}`));
});
// menu summary of commands end

/* On mention with command
ex User enters @botname framework, the bot will write back in markdown
*/

// FEATURE: PRODUCT SEARCH START///////////////////////////////////////
//product search to see how to store and retrieve from database

framework.hears(/add product/, function (bot, trigger) {
  console.log("someone asked for a card");
  responded = true;
  //funcaddprod(bot.sendCard(createproductcardJSON, 'This is customizable fallback text for clients that do not support buttons & cards'));
  bot.sendCard(createproductcardJSON, 'This is customizable fallback text for clients that do not support buttons & cards');

});

//figure out how to put input into name var
let createproductcardJSON =
{
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "type": "AdaptiveCard",
  "version": "1.0",
  "body": [
    {
      "type": "ColumnSet",
      "columns": [
        {
          "type": "Column",
          "width": 2,
          "items": [
            {
              "type": "TextBlock",
              "text": "Add Product",
              "weight": "bolder",
              "size": "medium"
            },
            {
              "type": "TextBlock",
              "text": "Enter the details of the product you would like to add. Then click submit once you are done.",
              "isSubtle": true,
              "wrap": true
            },


            {
              "type": "TextBlock",
              "text": 'Product Code: ',
              "wrap": true
            },
            {
              "type": "Input.Number",
              "id": "prodcode", // put input in here without quotes (storing name as data in db rn)
              "placeholder": "eg. 1001"
            },


            {
              "type": "TextBlock",
              "text": "Product Title:",
              "wrap": true
            },
            {
              "type": "Input.Text",
              "id": "prodtitle",
              "placeholder": "eg. Pen"
            },

            {
              "type": "TextBlock",
              "text": "Description",
              "wrap": true
            },
            {
              "type": "Input.Text",
              "id": "proddesc",
              "placeholder": "eg. Red",

            },

            {
              "type": "TextBlock",
              "text": "Quantity:",
              "wrap": true
            },
            {
              "type": "Input.Number",
              "id": "prodquantity",
              "placeholder": "eg. 100",
            },

            {
              "type": "TextBlock",
              "text": "Price:",
              "wrap": true
            },
            {
              "type": "Input.Number",
              "id": "prodprice",
              "placeholder": "eg. 10.50",
            },
            {
              "type": "TextBlock",
              "text": "Notify at Low Quantity:",
              "wrap": true
            },
            {
              "type": "Input.Number",
              "id": "prodnotify",
              "placeholder": "eg. 5",
            },

          ]
        },

      ]
    }
  ],
  "actions": [
    {
      "type": "Action.Submit",
      "title": "Submit"
    }
  ]
}



framework.hears(/search/i, function (bot, trigger) {
  console.log("this is inside search.");
  responded = true;

  let botName = bot.person.displayName;
  searchmsg = `What product are you searching for? Please reply with product code. (eg. '1001'). \nDon't forget to *@${botName}* at the start of your response.`;
  bot.say('markdown', searchmsg)
    .then(() => searchcode(bot));
  //bot.reply(trigger.message);
});

function searchcode() {
  responded = true;
  framework.hears(/[1-9][0-9]/i, function (bot, trigger) {
    console.log("inside searchcode");
    responded = true;
    var usersearch = trigger.text
    var usersearchStr = JSON.stringify(usersearch)
    var usersearchObj = JSON.parse(usersearchStr)
    let newusersearchstr = usersearchObj.substring(4)
    //console.log("user search for: " + trigger.text + " ||" + newusersearchstr )
    responded = true;
    //bot.reply(trigger.message, 'Searching for product...','markdown');
    //read damn message input and write param inside where
    Product.findOne({
      where: {
        prodcode: newusersearchstr
      }, raw: true
    }).then((product) => {
      if (product) {
        bot.reply(trigger.message, "I found this product... \n \nProduct Code: " + product.prodcode +
          " \nTitle: " + product.prodtitle +
          " \nDescription: " + product.proddesc +
          " \nQuantity: " + product.prodquantity +
          " \nPrice: $" + product.prodprice.toFixed(2))
      } else {
        bot.reply("No record of product.")
      }
    }).catch(err => console.log(err));
  });
}
 
framework.hears(/edit product/, function (bot, trigger) {
  console.log("someone asked for a card");
  responded = true;
  //funcaddprod(bot.sendCard(createproductcardJSON, 'This is customizable fallback text for clients that do not support buttons & cards'));
  //bot.sendCard(updateproductcardJSON, 'This is customizable fallback text for clients that do not support buttons & cards');
  let botName = bot.person.displayName;
  updprodmsg = `Please enter the product code that you want to edit. \nDon't forget to *@${botName}* at the start of your response.`;
  bot.say('markdown', updprodmsg)
    .then(() => toupdate());
});

function toupdate() {
  responded = true;
  framework.hears(/[1-9][0-9]{3}/i, function (bot, trigger) {
    responded = true;
    var usersearch = trigger.text
    var usersearchStr = JSON.stringify(usersearch)
    var usersearchObj = JSON.parse(usersearchStr)
    let newusersearchstr = usersearchObj.substring(4)
    responded = true;

    Product.findOne({
      where: {
        prodcode: newusersearchstr
      }, raw: true
    }).then((product) => {
      if (product) { 
        let newpcode = product.prodcode
        let newptitl = product.prodtitle
        let newpdesc = product.proddesc
        let newpquan = product.prodquantity
        let newppric = product.prodprice
        let newpnoti = product.prodnotify

        updateproduct(bot, newpcode, newptitl, newpdesc, newpquan, newppric, newpnoti)
      } else {
        bot.say("No record of product.")
      }
    }).catch(err => console.log(err));
  });
}

//test tmr it doesnt work
function updateproduct(bot, newpcode, newptitl, newpdesc, newpquan, newppric, newpnoti) {
  let updateproductcardJSON =
  {
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "type": "AdaptiveCard",
    "version": "1.0",
    "body": [
      {
        "type": "ColumnSet",
        "columns": [
          {
            "type": "Column",
            "width": 2,
            "items": [
              {
                "type": "TextBlock",
                "text": "Update Product " + newpcode,
                "weight": "bolder",
                "size": "medium"
              },
              {
                "type": "TextBlock",
                "text": "Update the details of the product you would like to add. Then click submit once you are done.",
                "isSubtle": true,
                "wrap": true
              },
  
              {
                "type": "Input.Number",
                "id": "prodcode", // put input in here without quotes (storing name as data in db rn)
                "value": newpcode,
                "isVisible": false
              },
  
              {
                "type": "TextBlock",
                "text": "Product Title:",
                "wrap": true
              },
              {
                "type": "Input.Text",
                "id": "prodtitle",
                "value": newptitl,
                "placeholder": "eg. Pen"
                
              },
  
              {
                "type": "TextBlock",
                "text": "Description",
                "wrap": true
              },
              {
                "type": "Input.Text",
                "id": "proddesc",
                "value": newpdesc,
                "placeholder": "eg. Red",
  
              },
  
              {
                "type": "TextBlock",
                "text": "Quantity:",
                "wrap": true
              },
              {
                "type": "Input.Number",
                "id": "prodquantity",
                "value": newpquan,
                "placeholder": "eg. 100",
              },
  
              {
                "type": "TextBlock",
                "text": "Price:",
                "wrap": true
              },
              {
                "type": "Input.Number",
                "id": "prodprice",
                "value": newppric,
                "placeholder": "eg. 10.50",
              },
              {
                "type": "TextBlock",
                "text": "Notify at Low Quantity:",
                "wrap": true
              },
              {
                "type": "Input.Number",
                "id": "prodnotify",
                "value": newpnoti,
                "placeholder": "eg. 5",
              },
  
            ]
          },
  
        ]
      }
    ],
    "actions": [
      {
        "type": "Action.Submit",
        "title": "Submit"
      }
    ]
  }

  // Product.update({
  //   prodtitle: newptitl,
  //   proddesc: newpdesc,
  //   prodquantity: newpquan,
  //   prodprice: newppric,
  //   prodnotify: newpnoti
  // }, { 
  //   where: {
  //     prodcode: newpcode
  //   }
  // }).then(() => {
  //   bot.sendCard(updateproductcardJSON, 'plswork')
  // })
  
  bot.sendCard(updateproductcardJSON, 'plswork').then(() => {
    Product.update({
      prodtitle: newptitl,
      proddesc: newpdesc,
      prodquantity: newpquan,
      prodprice: newppric,
      prodnotify: newpnoti
    }, { 
      where: {
        prodcode: newpcode
      }
    })
  })
}




// process a submitted card////

// function funcaddprod() {
// framework.on('attachmentAction', function (bot, trigger) {
//   // bot.say(`Got an attachmentAction:\n${JSON.stringify(trigger.attachmentAction,null,2)}`);///
//   //bot.reply(trigger.attachmentAction, 'Product has been added.');
//   console.log("adding product");
//   var response = trigger.attachmentAction
//   var responseStr = JSON.stringify(response)
//   var responseObj = JSON.parse(responseStr)
//   var responseInput = responseObj.inputs
//   // console.log(responseInput)
//   Product.create(responseInput).then((product) => {
//     console.log("product in db");
//     bot.reply(trigger.attachmentAction, 'Product has been added.');
//   })
// });
// }

// FEATURE: PRODUCT SEARCH END///////////////////////////////////////

// TRY FEATURE: SURVEY QN START///////////////////////////////////////
framework.hears(/createsurvey/, function (bot, trigger) {
  console.log("survey qn card here");
  responded = true;
  //funcnewcard(bot.sendCard(newcardJSON,'This is customizable fallback text for clients that do not support buttons & cards'));
  bot.sendCard(surveyqnsCARD, 'This is customizable fallback text for clients that do not support buttons & cards')

});

let surveyqnsCARD =
{
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "type": "AdaptiveCard",
  "version": "1.0",
  "body": [
    {
      "type": "ColumnSet",
      "columns": [
        {
          "type": "Column",
          "width": 2,
          "items": [
            {
              "type": "TextBlock",
              "text": "Create Survey",
              "weight": "bolder",
              "size": "medium"
            },
            {
              "type": "TextBlock",
              "text": "This survey is to be sent to your respective employees. Please input your questions you want to add into your survey.",
              "isSubtle": true,
              "wrap": true
            },


            {
              "type": "TextBlock",
              "text": 'Survey Code',
              "wrap": true
            },
            {
              "type": "Input.Number",
              "id": "scode", // put input in here without quotes (storing name as data in db rn)
              "placeholder": "Enter survey code here"
            },
            {
              "type": "TextBlock",
              "text": 'Title',
              "wrap": true
            },
            {
              "type": "Input.Text",
              "id": "stitle", // put input in here without quotes (storing name as data in db rn)
              "placeholder": "Enter title here"
            },
            {
              "type": "TextBlock",
              "text": 'Description',
              "wrap": true
            },
            {
              "type": "Input.Text",
              "id": "sdescription", // put input in here without quotes (storing name as data in db rn)
              "placeholder": "Enter description here"
            },
            {
              "type": "TextBlock",
              "text": "Question 1",
              "wrap": true
            },
            {
              "type": "Input.Text",
              "id": "sqn1"
            },
            {
              "type": "TextBlock",
              "text": "Question 2",
              "wrap": true
            },
            {
              "type": "Input.Text",
              "id": "sqn2",
            },
            {
              "type": "TextBlock",
              "text": "Question 3"
            },
            {
              "type": "Input.Text",
              "id": "sqn3"
            },
            {
              "type": "TextBlock",
              "text": "Question 4"
            },
            {
              "type": "Input.Text",
              "id": "sqn4"
            },
            {
              "type": "TextBlock",
              "text": "Question 5"
            },
            {
              "type": "Input.Text",
              "id": "sqn5"
            },

          ]
        },

      ]
    }
  ],
  "actions": [
    {
      "type": "Action.Submit",
      "title": "Submit",
      "id": "surveyqncardID"
    }
  ]
}

// framework.hears(/answersurvey/, function (bot, trigger) {
//   console.log("in answersurvey");
//   responded = true;
//   let botName = bot.person.displayName;
//   surmsg = `Please enter the survey code. \nDon't forget to *@${botName}* at the start of your response.`;
//   bot.say('markdown', surmsg)
//     .then(() => newsurveycode());
//   //.then(() => surveycode());

// });

framework.hears(/sendsurvey/, function (bot, trigger) {
  console.log("in sendsurvey");
  responded = true;
  let botName = bot.person.displayName; 
  surmsg = `Please enter the survey code that you want everyone to respond to. \nDon't forget to *@${botName}* at the start of your response.`;
  bot.say('markdown', surmsg)
    .then(() => newsurveycode());
  //.then(() => surveycode());

});

function newsurveycode() {
  responded = true;
  console.log("in newsurveycode here func")
  framework.hears(/[1-9][0-9]/i, function (bot, trigger) {
    console.log("in newsurveycode here")
    responded = true;
    var usersearch = trigger.text
    var usersearchStr = JSON.stringify(usersearch)
    var usersearchObj = JSON.parse(usersearchStr)
    let newusersearchstr = usersearchObj.substring(4)
    //console.log("user search for: " + trigger.text + " ||" + newusersearchstr )
    responded = true;

    //add below here
    SurveyQuestions.findOne({
      where: {
        scode: newusersearchstr
      }, raw: true
    }).then((surveyquestions) => {
      //console.log("the code: " + surveyquestions + " | " + surveyquestions.scode)

      //@everyone here and send the survey out --> 

      if (surveyquestions) {
        // let ansename = trigger.person.displayName
        // let ansemail = trigger.person.emails[0]
        let ansscode = surveyquestions.scode
        let anstitle = surveyquestions.stitle
        let ansdescr = surveyquestions.sdescription
        let ansques1 = surveyquestions.sqn1
        let ansques2 = surveyquestions.sqn2
        let ansques3 = surveyquestions.sqn3
        let ansques4 = surveyquestions.sqn4
        let ansques5 = surveyquestions.sqn5
        bot.say("Hello everyone. Please respond to survey #" + ansscode + ". I will send it to your private message shortly.")
        //read everyone in room (say hi to everyone), then add below function inside the loop 
        //sendsurvey(bot, ansename, ansemail, ansscode, anstitle, ansdescr, ansques1, ansques2, ansques3, ansques4, ansques5)

        //get name and email by looping throguh everyone 
        bot.webex.memberships.list({ roomId: bot.room.id })
          .then((memberships) => {
            for (const member of memberships.items) {
              if (member.personId === bot.person.id) {
                // Skip myself!
                console.log("inside the forloop in survey")
                continue;
              }
              let ansename = (member.personDisplayName) ? member.personDisplayName : member.personEmail;
              let ansemail = (member.personEmail) ? member.personEmail : member.personDisplayName;
              //bot.say(`Hello ${ansename}, this is your email ${ansemail}.`)
              console.log(ansename, ansemail, ansscode, anstitle, ansdescr, ansques1, ansques2, ansques3, ansques4, ansques5)
              sendsurvey(bot, ansename, ansemail, ansscode, anstitle, ansdescr, ansques1, ansques2, ansques3, ansques4, ansques5)
            }
          })
          .catch((e) => {
            //console.error(`Call to sdk.memberships.get() failed: ${e.messages}`);
            bot.say('Hello everybody!');
          });




      } else {
        bot.say("Invalid survey code.")
      }

    }).catch(err => console.log(err));
  });
}


function sendsurvey(bot, ansename, ansemail, ansscode, anstitle, ansdescr, ansques1, ansques2, ansques3, ansques4, ansques5) {
  //let answersurCARD = {card}
  bot.dmCard(
    ansemail,
    {
      "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
      "type": "AdaptiveCard",
      "version": "1.0",
      "body": [
        {
          "type": "ColumnSet",
          "columns": [
            {
              "type": "Column",
              "width": 2,
              "items": [
                {
                  "type": "TextBlock",
                  "text": anstitle,
                  "weight": "bolder",
                  "size": "medium"
                },
                {
                  "type": "TextBlock",
                  "text": "Hello " + ansename,
                  "isSubtle": true,
                  "wrap": true
                },
                {
                  "type": "TextBlock",
                  "text": ansdescr + " (Survey Code: " + ansscode + ")",
                  "isSubtle": true,
                  "wrap": true
                },

                {
                  "type": "Input.Text",
                  "id": "aname", // put input in here without quotes (storing name as data in db rn)
                  "value": ansename,
                  "isVisible": false
                },
                {
                  "type": "Input.Number",
                  "id": "asurcode", // put input in here without quotes (storing name as data in db rn)
                  "value": ansscode,
                  "isVisible": false
                },
                {
                  "type": "Input.Text",
                  "id": "aemail", // put input in here without quotes (storing name as data in db rn)
                  "value": ansemail,
                  "isVisible": false
                },

                {
                  "type": "TextBlock",
                  "text": ansques1,
                  "wrap": true
                },
                {
                  "type": "Input.Text",
                  "id": "aq1", // put input in here without quotes (storing name as data in db rn)
                  "placeholder": "Enter your answer here"
                },
                {
                  "type": "TextBlock",
                  "text": ansques2,
                  "wrap": true
                },
                {
                  "type": "Input.Text",
                  "id": "aq2", // put input in here without quotes (storing name as data in db rn)
                  "placeholder": "Enter your answer here"
                },
                {
                  "type": "TextBlock",
                  "text": ansques3,
                  "wrap": true
                },
                {
                  "type": "Input.Text",
                  "id": "aq3", // put input in here without quotes (storing name as data in db rn)
                  "placeholder": "Enter your answer here"
                }, {
                  "type": "TextBlock",
                  "text": ansques4,
                  "wrap": true
                },
                {
                  "type": "Input.Text",
                  "id": "aq4", // put input in here without quotes (storing name as data in db rn)
                  "placeholder": "Enter your answer here"
                },
                {
                  "type": "TextBlock",
                  "text": ansques5,
                  "wrap": true
                },
                {
                  "type": "Input.Text",
                  "id": "aq5", // put input in here without quotes (storing name as data in db rn)
                  "placeholder": "Enter your answer here"
                },

              ]
            },

          ]
        }
      ],
      "actions": [
        {
          "type": "Action.Submit",
          "title": "Submit",
          "id": "surveyqncardID"
        }
      ]
    }
  )
}

framework.hears(/surveyresponse/i, function (bot, trigger) {
  console.log("this is inside surveyresponse.");
  responded = true;

  let botName = bot.person.displayName;
  surveymsg = `Enter the survey code of the responses that you want to retrieve.  \nDon't forget to *@${botName}* at the start of your response.`;
  bot.say('markdown', surveymsg)
  
    .then(() => getsurvey(bot));
  //bot.reply(trigger.message);
});


function getsurvey() {
  responded = true;
  console.log("this is inside getsurvey func.");
  framework.hears(/[1-9][0-9]/i, function (bot, trigger) {
    console.log("inside getsurvey");
    responded = true;
    var usersurvey = trigger.text
    var usersurveyStr = JSON.stringify(usersurvey)
    var usersurveyObj = JSON.parse(usersurveyStr)
    let newusersurveystr = usersurveyObj.substring(4)
    //console.log("user search for: " + trigger.text + " ||" + newusersearchstr )
    responded = true;
    //bot.reply(trigger.message, 'Searching for product...','markdown');
    //read damn message input and write param inside where
    Survey.findAll({
      where: {
        asurcode: newusersurveystr
      }, raw: true
    }).then((survey) => {

      console.log("in survey then")
      survey.forEach(surveyobj => {
        console.log("inresponse forloop")
        if (surveyobj.asurcode != null) {
          console.log("inresponse notnull")
          console.log("survey: " + survey)
          console.log("surveyobj: " + surveyobj + " , " + surveyobj.asurcode)

          //i++ //increment message is a dog
          //let fbresponsemsg = `**RESPONSE:**`;
          let usersurveystr = "Respondent: " + surveyobj.aname + " (" + surveyobj.aemail + ")" +
            " \nAnswers for..." +
            " \nQ1. " + surveyobj.aq1 +
            " \nQ2. " + surveyobj.aq2 +
            " \nQ3. " + surveyobj.aq3 +
            " \nQ4. " + surveyobj.aq4 +
            " \nQ5. " + surveyobj.aq5
          bot.say("RESPONSE: " + usersurveystr);
        } else {
          console.log("inresponse else")
          bot.say("No responses for survey #" + newusersearchstr + " yet.");
        }
      })
    }).catch(err => console.log(err));
  });

}

// fking fail shit idk how to do  ----------------------------------------------
//for   sake
// framework.hears('answersurvey', function (bot, trigger) {
//   console.log("framework command received");
//   responded = true;
//   //console.log("GET ROLE: " + trigger.person.id + ", " + trigger.person.actorId + ", " + trigger.person.role)
//   SurveyQuestions.findOne({
//      where: {
//        id: 1
//      }, raw: true
//   }).then((surveyquestions) => {
//     let qnum = 1;
//     //let answer = ""
//     bot.say("This survey is a " + surveyquestions.stitle + "\n" + surveyquestions.sdescription 
//     + "\nLet's start...")

//     // nabei?????????
//     .then(() => { 
//       bot.say("Q"+qnum+". " + surveyquestions.sqn1)
//       qnum += 1;
//       forsurvey(surveyquestions) 
//       let a1 = forsurvey(surveyquestions) 
//       console.log("FIRST ANSWER:" + a1 )
//     }) 

//     // .then(() => { 
//     //   bot.say("Q"+qnum+". " + surveyquestions.sqn2)
//     //   qnum += 1;
//     //   forsurvey(surveyquestions) 
//     //   console.log("SECOND ANSWER:" + forsurvey(surveyquestions) )
//     // })
//     // .then(() => forsurvey(bot))
//     // .then(() => forsurvey(bot))
//     // .then(() => forsurvey(bot))
//     //.then(() => {

//     //bot.say("this here: " + i)

//     //for (let i = 2; i < surveyquestions.length; i++) {
//       //not inside
//       //console.log("i is here: "+ i)
//     //}

//     //.then((surveyquestions) => forsurvey(bot, surveyquestions)
//       //responded = false;
//       // if (trigger.person.responded) {
//       //   console.log("THE MESSAGE: " + trigger.person.responded + "|"+ trigger.text);
//       //   bot.say("Q2. " + surveyquestions.sqn2)
//       //     //.then(() => sendHelp(bot))
//       //     //.then(() => mainmenu(bot))
//       //     .catch((e) => console.error(`Problem in the unexepected command hander: ${e.message}`));
//       // }

//   //responded = false;

//     //   //bot.say(trigger.message, "Please complete and submit" + surveyquestions.stitle + "\n\n\n"  + surveyquestions.sdescription)
//     // }
//   }).catch(err => console.log(err));
// });

// function forsurvey() {
//for (let qnum in surveyquestions[3]){
//bot.say("Q"+qnum+". " + surveyquestions.sqn1)
//}
// console.log("am starting to think that this is hella impossible")
// let answer = ""
// framework.hears(/.*/, function (bot, trigger) {
//   answer = trigger.text
//   console.log("forsur: " + trigger.text + "," + answer)

// });
// return answer;
// }

// function surveycode() {
//   console.log("inside surveycode function")
//   responded = true;
//   framework.hears(/[1-9][0-9]/i, function (bot, trigger) {
//     console.log("inside surveycode");
//     var surveycode = trigger.text
//     var surveycodeStr = JSON.stringify(surveycode)
//     var surveycodeObj = JSON.parse(surveycodeStr)
//     let newsurveycodestr = surveycodeObj.substring(4)
//     console.log("user search for: " + trigger.text + " ||" + newsurveycodestr)
//     responded = true;
//     //bot.reply(trigger.message, 'Searching for product...','markdown');
//     //read damn message input and write param inside where
//     SurveyQuestions.findOne({
//       where: {
//         scode: newsurveycodestr
//       }, raw: true
//     }).then((surveyans) => {
//       let qnlist = [];
//       console.log("it is here: " + surveyans.scode)
//       if (surveyans) {
//         let botName = bot.person.displayName;
//         surmsg2 = `This survey is ${surveyans.stitle} 
//                   \n${surveyans.sdescription} 
//                   \nYou can answer the question by saying *@${botName}* at the start of your response.
//                   \nLet's start...`;
//         bot.say('markdown', surmsg2)
//         // bot.say("This survey is a " + surveyans.stitle + "\n"
//         //   + surveyans.sdescription
//         //   + "\nYou can answer the question by "
//         //   + "\nLet's start...")
//         qnlist.push(surveyans.sqn1)
//         qnlist.push(surveyans.sqn2)
//         qnlist.push(surveyans.sqn3)
//         qnlist.push(surveyans.sqn4)
//         qnlist.push(surveyans.sqn5)
//         console.log("LIST: " + qnlist)
//         surveyanswer(bot, trigger, qnlist)
//         // if (qnlist != null) {
//         //   //console.log("jdfs")
//         //   var i = 1
//         //   qnlist.forEach(aqn => {
//         //     bot.say(i + ". " + aqn)
//         //     i++
//         //     surveyanswer(bot)
//         //   })
//         // } else {
//         //   bot.say("No asddadsrey. ")
//         // }

//       } else {
//         bot.say("No record of survey. ")
//       }
//     })
//       // .then((qnlist) => { })
//       .catch(err => console.log("inhere" + err));
//   });
// }
// //not in order

// function surveyanswer(bot, trigger, qnlist) {
//   console.log("LISTINFUNC: " + qnlist)
//   if (qnlist != null) {
//     //console.log("jdfs")
//     var i = 1
//     qnlist.forEach(aqn => {
//       bot.say(i + ". " + aqn)
//       console.log(i + ". " + aqn)
//       i++
//       // var sresponse = trigger.text
//       // var sresponseStr = JSON.stringify(sresponse)
//       // var sresponseObj = JSON.parse(sresponseStr)
//       // console.log("ANSWER: " + sresponseObj)
//       // surveyanswer(bot)
//       oneqn(bot)
//     })
//   } else {
//     bot.say("No asddadsrey. ")
//   }
//   //not hearing and go back to loop
//   function oneqn(bot) {
//     console.log("in oneqn func")
//     framework.hears(/svanswer/, function (bot, trigger) {
//       console.log("inside svanswer")
//       responded = true;
//       var sresponse = trigger.text
//       var sresponseStr = JSON.stringify(sresponse)
//       var sresponseObj = JSON.parse(sresponseStr)
//       console.log("ANSWER: " + sresponseObj)
  
  
//       // surveyans.forEach(surveyobj => {
//       // });
//     });
//   }
  
// }


// fking fail shit idk how to do  ----------------------------------------------
// TRY FEATURE: SURVEY QN END///////////////////////////////////////

// FEATURE: FEEDBACK START ///////////////////////////////////////
framework.hears('feedback', function (bot, trigger, actorId) {
  //call feedback function to trigger
  console.log("in feedback");
  responded = true;
  let botName = bot.person.displayName;
  msg1 = `Hello! You can tell us anything regarding your satisfaction at work. Don't worry, your feedback will be kept anonymous. \nDon't forget to *@${botName}* and say **fbanswer** at the start of your response.`;
  bot.say('markdown', msg1)
  // working?????
});

framework.hears(/fbanswer/, function (bot, trigger) {
  // then write feedback response here 
  console.log("inside fbanswer")
  responded = true;
  var fbresponse = trigger.text
  var fbresponseStr = JSON.stringify(fbresponse)
  var fbresponseObj = JSON.parse(fbresponseStr)
  console.log("ANSWER: " + fbresponseObj)

  var newdate = new Date()
  var datestr = JSON.stringify(newdate)
  var dateObj = JSON.parse(datestr)
  let cutdate = dateObj.substring(0,10)
  Feedback.create({
    fbdate: cutdate,
    fbresponse: fbresponseObj
  }).then(() => {
    console.log("feedback in db")
    bot.say("Thank you for your response! We will review it soon and take it to consideration.")
  })
});

framework.hears(/seefeedback/, function (bot, trigger) {
  //see all the feedback given
  console.log("inside seefeedback")
  //bot.say("List of feedbacks...")
  responded = true;
  Feedback.findAll({
    where: {},
    raw: true,
  }).then((feedback) => {
    //var i = 0
    console.log("inresponse then")
    feedback.forEach(feedbackobj => {
      console.log("inresponse forloop")
      if (feedbackobj.fbresponse != null) {
        console.log("inresponse notnull")
        //i++ //increment message is a dog
        //let fbresponsemsg = `**RESPONSE:**`;
        let newstr = (feedbackobj.fbresponse).substring(13)
        bot.say("RESPONSE ON " + feedbackobj.fbdate + ": "+ newstr);
      } else {
        console.log("inresponse else")
        bot.say("No feedbacks yet.");
      }
    })
  }).catch(err => console.log(err));
});
// FEATURE: FEEDBACK END ///////////////////////////////////////

// FEATURE: HELPBOT START ///////////////////////////////////////
framework.hears('helpbot', function(bot,trigger){
  console.log("called for helpbot card");    
  responded = true;
  bot.sendCard(wagwan, 'what wld u do?')
  });
 
let wagwan =
  {
    "type": "AdaptiveCard",
    "body": [
        {
            "type": "ColumnSet",
            "columns": [
                {
                    "type": "Column",
                    "items": [
                        {
                            "type": "Image",
                            "style": "Person",
                            "url": "https://developer.webex.com/images/webex-teams-logo.png",
                            "size": "Medium",
                            "height": "50px"
                        }
                    ],
                    "width": "auto"
                },
                {
                    "type": "Column",
                    "items": [
                        {
                            "type": "TextBlock",
                            "text": "Cisco Webex Teams",
                            "weight": "Lighter",
                            "color": "Accent"
                        },
                        {
                            "type": "TextBlock",
                            "weight": "Bolder",
                            "text": "HelpBot",
                            "wrap": true,
                            "color": "Light",
                            "size": "Large",
                            "spacing": "Small"
                        }
                    ],
                    "width": "stretch"
                }
            ]
        },
        {
            "type": "TextBlock",
            "text": "Hello im Albert, i heard you call for help! Is there anything i can help you with? ",
            "wrap": true
           
        },
        {
            "type": "TextBlock",
            "text": "Please select one of the above options:"
        },
        {
            "type": "ActionSet"
        }
    ],
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "version": "1.2",
    "actions": [
        {
            "type": "Action.Execute",
            "title": "More Info",
            //"callback_data": hek
           
        },
        {
          "type": "Action.ShowCard",
          "title": "Alcohol Products",
          "card": {
            "type": "AdaptiveCard",
            "body": [
              {
                "type": "TextBlock",
                "text": "You have to separately packed them into another box"
              }
            ]
            }
        },
        {
          "type": "Action.ShowCard",
          "title": "Glassware",
          "id": "cardtotoggle", //////test for Action.ToggleVisibility
          "card": {
            "type": "AdaptiveCard",
            "body": [
              {
                "type": "TextBlock",
                "text": "Handle them with gloves"
              }
            ]
            }
        },
        {
          "type": "Action.Execute",
          "title": "Not Helpful",
          "data": "edit",
          //"onclick" 
          //IS IT ACTION???
 
        }
    ]
  };
// FEATURE: HELPBOT END ///////////////////////////////////////

// FEATURE: NOTIFICATIONS START ////////////////////////////////

// function notifications(bot) {
// console.log("inside notif func")
framework.hears(/lowstock/, function (bot, trigger) {
  responded = true;
  Product.findAll({
    where: {},
    raw: true,
  }).then((product) => {
    //productlist.push(product)
    //console.log("outside notifs if: " + product) //this is printing both objects below dk which one to call 
    product.forEach(prodobj => {
      //var count = 0
      //console.log("--------------test for each--------------")
      //this is sending message for
      if (prodobj.prodquantity < prodobj.prodnotify) {
        bot.say("Item " + prodobj.prodtitle + " is low in stock. Product code #" + prodobj.prodcode + " (" + prodobj.prodquantity + " items left)")

      }
      //console.log("count: " + count)
    });
  }).catch(err => console.log(err));
});
// }


//DONT DELETE (this iterates through each key/value in object dict)
//for ( const [key,value] of Object.entries(prodobj)) {
//console.log("key: " + key + " || value: " + value + " || retrieves value of key: " +prodobj.prodquantity )
//}

// FEATURE: NOTIFICATIONS END ////////////////////////////////

// FEATURE: AGENDA START ////////////////////////////////
framework.hears(/set tasks/, function (bot, trigger) {
  console.log("some1 called for create tasks");
  responded = true;
  let email = trigger.person.emails[0];
  let thedate = new Date();
  bot.say(`Sending ${trigger.person.displayName} a card privately.`)
    .then(() =>dmAgenda(bot, email, thedate))
    .catch((e) => console.error(`Problem in help hander: ${e.message}`));
});
function dmAgenda(bot, email, thedate){
  var newdate = new Date()
  var datestr = JSON.stringify(newdate)
  var dateObj = JSON.parse(datestr)
  let cutdate = dateObj.substring(0,10)
  console.log("cutdate: " + cutdate + ", " + datestr)
  bot.dmCard(
    email,
    {
      "type": "AdaptiveCard",
      "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
      "version": "1.2",
      "body": [
        {
          "type": "TextBlock",
          "text": cutdate +"'s Tasks",
          "wrap": true,
          "weight": "bolder",
          "size": "medium"
      },
      {
          "type": "Input.Text", //store date without showing on card (cannot edit)
          "id": "today",
          "value": cutdate,
          "isVisible": false
         
      },
          {
              "type": "TextBox",
              "text": "Please Enter the Tasks For Today:",
              "wrap": true
          },
          {
              "type": "Input.Text",
              "id": "agenda1",
              "placeholder": "e.g finish all excels"
             
          }
      ],
      "actions": [
          {
              "type": "Action.Submit",
              "title": "Submit",
              "wrap": "true"
          },
          {
              "type": "Action.ShowCard",
              "title": "Add Tasks",
              "card": {
                  "type": "AdaptiveCard",
                  "body": [
                      {
                          "type": "Input.Text",
                          "id": "agenda2",
                          "placeholder": "Please Enter a Task"
                      }
                  ],
                  "actions": [
                      {
                          "type": "Action.Submit",
                          "title": "Submit"
                      },
                      {
                          "type": "Action.ShowCard",
                          "title": "Add Tasks",
                          "card": {
                              "type": "AdaptiveCard",
                              "body": [
                                  {
                                      "type": "Input.Text",
                                      "id": "agenda3",
                                      "placeholder": "Enter a Task"
                                  }
                              ],
                              "actions": [
                                  {
                                      "type": "Action.Submit",
                                      "title": "Submit"
                                  }
                              ]
                          }
                      }
                  ]
              }
          }
      ]
    },
        "This is the fallback text if the client can't render this card");
    }
     

framework.hears(/gettasks/, function (bot, trigger) {
  responded = true;

  var newdate = new Date()
  var datestr = JSON.stringify(newdate)
  var dateObj = JSON.parse(datestr)
  let cutdate = dateObj.substring(0,10)
  console.log("the date: " + cutdate)
  Agenda.findOne({
    where: {today: cutdate},
    raw:true,
  }).then((tasks) => {
    if(tasks.agenda2 == null) { 
      bot.say("Here are the tasks for today")
      let a1 = tasks.agenda1
      firsttaskcard(bot, a1 )
      
    } else if(tasks.agenda3 == null) { 
      bot.say("Here are the tasks for today")
      let a1 = tasks.agenda1
      let a2 = tasks.agenda2
      secondtaskcard(bot, a1, a2)
    } else if(tasks.agenda3 != null) { 
      bot.say("Here are the tasks for today")
      let a1 = tasks.agenda1
      let a2 = tasks.agenda2
      let a3 = tasks.agenda3
      thirdtaskcard(bot, a1, a2, a3)
      
    } 
    else{
      bot.say("There are no tasks for the day.")
    }
  }).catch(err => console.log(err));

});



function firsttaskcard(bot, a1) {

  let firstcard =
  {
    "type": "AdaptiveCard",
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "version": "1.2",
    "body": [
      {
        "type": "TextBlock",
        "text": a1,
        "wrap": true,
      },

    ]
  }
  bot.sendCard(firstcard, "bruh")
}

function secondtaskcard(bot, a1, a2) {

  let secondcard =
  {
    "type": "AdaptiveCard",
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "version": "1.2",
    "body": [
      {
        "type": "TextBlock",
        "text": "1. " + a1,
        "wrap": true,
      },
      {
        "type": "TextBlock",
        "text": "2. " + a2,
        "wrap": true,
      },

    ]
  }
  bot.sendCard(secondcard, "bruh")
}

function thirdtaskcard(bot, a1, a2, a3) {

  let thirdcard =
  {
    "type": "AdaptiveCard",
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "version": "1.2",
    "body": [
      {
        "type": "TextBlock",
        "text": "1. " + a1,
        "wrap": true,
      },
      {
        "type": "TextBlock",
        "text": "2. " + a2,
        "wrap": true,
      },
      {
        "type": "TextBlock",
        "text": "3. " + a3,
        "wrap": true,
      },

    ]
  }
  bot.sendCard(thirdcard, "bruh")
}

// FEATURE: MANAGEMENT - AGENDA END ////////////////////////////////

// FEATURE: MANAGEMENT - WEATHER START ////////////////////////////////

framework.hears('weather', function(bot,trigger){
  console.log("called for weather real af lol");    
  responded = true;
  bot.sendCard(Wcard, 'what wld u do?')
  });
 
let Wcard =
{
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "type": "AdaptiveCard",
  "version": "1.0",
  "backgroundImage": "https://messagecardplayground.azurewebsites.net/assets/Mostly%20Cloudy-Background.jpg",
  "body": [
    {
      "type": "ColumnSet",
      "columns": [
        {
          "type": "Column",
          "width": "35",
          "items": [
            {
              "type": "Image",
              "url": "https://messagecardplayground.azurewebsites.net/assets/Mostly%20Cloudy-Square.png",
              "size": "stretch",
              "altText": "Mostly cloudy weather"
            }
          ]
        },
        {
          "type": "Column",
          "width": "65",
          "items": [
            {
              "type": "TextBlock",
              "text": "Thursday, May 26, 2022", ///////////////////change the date lololololol
              "weight": "bolder",
              "size": "large",
              "wrap": true
            },
            {
              "type": "TextBlock",
              "text": "32 / 50",
              "size": "medium",
              "spacing": "none",
              "wrap": true
            },
            {
              "type": "TextBlock",
              "text": "31% chance of rain",
              "spacing": "none",
              "wrap": true
            },
            {
              "type": "TextBlock",
              "text": "Winds 4.4 mph SSE",
              "spacing": "none",
              "wrap": true
            }
          ]
        }
      ]
    },
    {
      "type": "ColumnSet",
      "columns": [
        {
          "type": "Column",
          "width": "20",
          "items": [
            {
              "type": "TextBlock",
              "horizontalAlignment": "center",
              "wrap": true,
              "text": "Wednesday"
            },
            {
              "type": "Image",
              "size": "auto",
              "url": "https://messagecardplayground.azurewebsites.net/assets/Drizzle-Square.png",
              "altText": "Drizzly weather"
            },
            {
              "type": "FactSet",
              "horizontalAlignment": "right",
              "facts": [
                {
                  "title": "High",
                  "value": "50"
                },
                {
                  "title": "Low",
                  "value": "32"
                }
              ]
            }
          ],
          "selectAction": {
            "type": "Action.OpenUrl",
            "title": "View Wednesday",
            "url": "https://www.microsoft.com"
          }
        },
        {
          "type": "Column",
          "width": "20",
          "items": [
            {
              "type": "TextBlock",
              "horizontalAlignment": "center",
              "wrap": true,
              "text": "Thursday"
            },
            {
              "type": "Image",
              "size": "auto",
              "url": "https://messagecardplayground.azurewebsites.net/assets/Mostly%20Cloudy-Square.png",
              "altText": "Mostly cloudy weather"
            },
            {
              "type": "FactSet",
              "facts": [
                {
                  "title": "High",
                  "value": "50"
                },
                {
                  "title": "Low",
                  "value": "32"
                }
              ]
            }
          ],
          "selectAction": {
            "type": "Action.OpenUrl",
            "title": "View Thursday",
            "url": "https://www.microsoft.com"
          }
        },
        {
          "type": "Column",
          "width": "20",
          "items": [
            {
              "type": "TextBlock",
              "horizontalAlignment": "center",
              "wrap": true,
              "text": "Friday"
            },
            {
              "type": "Image",
              "size": "auto",
              "url": "https://messagecardplayground.azurewebsites.net/assets/Mostly%20Cloudy-Square.png",
              "altText": "Mostly cloudy weather"
            },
            {
              "type": "FactSet",
              "facts": [
                {
                  "title": "High",
                  "value": "59"
                },
                {
                  "title": "Low",
                  "value": "32"
                }
              ]
            }
          ],
          "selectAction": {
            "type": "Action.OpenUrl",
            "title": "View Friday",
            "url": "https://www.microsoft.com"
          }
        },
        {
          "type": "Column",
          "width": "20",
          "items": [
            {
              "type": "TextBlock",
              "horizontalAlignment": "center",
              "wrap": true,
              "text": "Saturday"
            },
            {
              "type": "Image",
              "size": "auto",
              "url": "https://messagecardplayground.azurewebsites.net/assets/Mostly%20Cloudy-Square.png",
              "altText": "Mostly cloudy weather"
            },
            {
              "type": "FactSet",
              "facts": [
                {
                  "title": "High",
                  "value": "50"
                },
                {
                  "title": "Low",
                  "value": "32"
                }
              ]
            }
          ],
          "selectAction": {
            "type": "Action.OpenUrl",
            "title": "View Saturday",
            "url": "https://www.microsoft.com"
          }
        }
      ]
    }
  ]
}

//FEATURE: MANAGEMENT - WEATHER END ////////////////////////////////

framework.hears('framework', function (bot) {
  var jds = new Date()
  var dfsfs = jds.getDate
  console.log("jds: " + jds + ", " + dfsfs)
  console.log("framework command received");
  responded = true;
  bot.say("markdown", "The primary purpose for the [webex-node-bot-framework](https://github.com/jpjpjp/webex-node-bot-framework) was to create a framework based on the [webex-jssdk](https://webex.github.io/webex-js-sdk) which continues to be supported as new features and functionality are added to Webex. This version of the project was designed with two themes in mind: \n\n\n * Mimimize Webex API Calls. The original flint could be quite slow as it attempted to provide bot developers rich details about the space, membership, message and message author. This version eliminates some of that data in the interests of efficiency, (but provides convenience methods to enable bot developers to get this information if it is required)\n * Leverage native Webex data types. The original flint would copy details from the webex objects such as message and person into various flint objects. This version simply attaches the native Webex objects. This increases the framework's efficiency and makes it future proof as new attributes are added to the various webex DTOs ");
});

/* On mention with command, using other trigger data, can use lite markdown formatting
ex User enters @botname 'info' phrase, the bot will provide personal details
*/
framework.hears('info', function (bot, trigger) {
  console.log("info command received");
  responded = true;
  //the "trigger" parameter gives you access to data about the user who entered the command
  let personAvatar = trigger.person.avatar;
  let personEmail = trigger.person.emails[0];
  let personDisplayName = trigger.person.displayName;
  // var assert = require('assert');
  // if(membership.isModerator = true) {
  //   console.log("is mod")
  // }
  let outputString = `Here is your personal information: \n\n\n **Name:** ${personDisplayName}  \n\n\n **Email:** ${personEmail} \n\n\n **Avatar URL:** ${personAvatar}`;
  bot.say("markdown", outputString);
});

/* On mention with bot data 
ex User enters @botname 'space' phrase, the bot will provide details about that particular space
*/
framework.hears('space', function (bot) {
  console.log("space. the final frontier");
  responded = true;
  let roomTitle = bot.room.title;
  let spaceID = bot.room.id;
  let roomType = bot.room.type;

  let outputString = `The title of this space: ${roomTitle} \n\n The roomID of this space: ${spaceID} \n\n The type of this space: ${roomType}`;

  console.log(outputString);
  bot.say("markdown", outputString)
    .catch((e) => console.error(`bot.say failed: ${e.message}`));
});

/* 
   Say hi to every member in the space
   This demonstrates how developers can access the webex
   sdk to call any Webex API.  API Doc: https://webex.github.io/webex-js-sdk/api/
*/
framework.hears("hi", function (bot) {
  console.log("say hi to everyone.  Its a party");
  responded = true;
  // Use the webex SDK to get the list of users in this space
  bot.webex.memberships.list({ roomId: bot.room.id })
    .then((memberships) => {
      for (const member of memberships.items) {
        if (member.personId === bot.person.id) {
          // Skip myself!
          continue;
        }
        let displayName = (member.personDisplayName) ? member.personDisplayName : member.personEmail;
        let displayEmail = (member.personEmail) ? member.personEmail : member.personDisplayName;
        bot.say(`Hello ${displayName}, this is your email ${displayEmail}.`)

        //idk bruh
        //.then(function(memberships) {
          // membership = memberships.items[0];
          // var assert = require('assert');
          // assert.equal(membership.isModerator, false);
          // membership.isModerator = true;
          // return webex.memberships.update(membership)
        //})
        // .then(function() {
        //   //console.log("it goes in here eeeee")
        //   return webex.memberships.get(membership.id);
        // })
        // .then(function(membership) {
        //   var assert = require('assert');
        //   assert.equal(membership.isModerator, true);
        //   return 'success';
        // });

      }
    })
    .catch((e) => {
      //console.error(`Call to sdk.memberships.get() failed: ${e.messages}`);
      bot.say('Hello everybody!');
    });
});

//////////////////////////////////////////////////////////START OF bs FORM//////////////////////////////////////////////////////////////////////////////////
//const thisid = null
framework.hears('card', function (bot, trigger) {
  console.log("someone asked for a card");
  responded = true;
  //funcnewcard(bot.sendCard(newcardJSON,'This is customizable fallback text for clients that do not support buttons & cards'));
  bot.sendCard(newcardJSON, 'This is customizable fallback text for clients that do not support buttons & cards')
});
// process a submitted card////

// function funcnewcard() { 
framework.on('attachmentAction', function (bot, trigger) {
  // bot.say(`Got an attachmentAction:\n${JSON.stringify(trigger.attachmentAction,null,2)}`);///
  // if (cardid = "newcardID") {
  bot.reply(trigger.attachmentAction, 'Your response has been recorded.');
  console.log("someone submitted a survey");
  var response = trigger.attachmentAction
  var responseStr = JSON.stringify(response)
  var responseObj = JSON.parse(responseStr)
  var responseInput = responseObj.inputs
  // console.log(responseInput)
  Survey.create(responseInput).then((survey) => {
    console.log("survey in db");
    //console.log("parTy pOoper is staNcey");
  })
  Product.create(responseInput).then((product) => {
    console.log("product in db");
  })
  SurveyQuestions.create(responseInput).then((surveyqn) => {
    console.log("survey questions in db");
  })
  Agenda.create(responseInput).then((agenda) => {
    console.log("agenda in db");
  })
  // } 
});
// }

//figure out how to put input into name var
let newcardJSON =
{
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "type": "AdaptiveCard",
  "version": "1.0",
  "body": [
    {
      "type": "ColumnSet",
      "columns": [
        {
          "type": "Column",
          "width": 2,
          "items": [
            {
              "type": "TextBlock",
              "text": "THis is a workplace survey aha",
              "weight": "bolder",
              "size": "medium"
            },
            {
              "type": "TextBlock",
              "text": "Hello, we are a group of NYP students who are developing a company management system and we would like to find out more about the satisfaction levels of working adults regarding stock and welfare management. This survey will only take you about 5-10 minutes of your time. Thank you!",
              "isSubtle": true,
              "wrap": true
            },
            {
              "type": "TextBlock",
              "text": "Do not worry, ur answers will be kept private so aha",
              "isSubtle": true,
              "wrap": true,
              "size": "small"
            },

            {
              "type": "TextBlock",
              "text": 'How often do you feel lost when your manager is not there to help you?(Y/N)',
              "wrap": true
            },
            {
              "type": "Input.Text",
              "id": "name", // put input in here without quotes (storing name as data in db rn)
              "placeholder": "John Andersen"
            },
            {
              "type": "TextBlock",
              "text": "Is it a hassle to always have to communicate with suppliers/managers regarding restocking of products?(Y/N)",
              "wrap": true
            },
            {
              "type": "Input.Text",
              "id": "email",
              "placeholder": "https://example.com"
            },
            {
              "type": "TextBlock",
              "text": "Would you prefer if you were notified when certain items are low in stock?",
              "wrap": true
            },
            {
              "type": "Input.Text",
              "id": "q1",
              "placeholder": "john.andersen@example.com",
              "style": "email"
            },
            {
              "type": "TextBlock",
              "text": "test"
            },
            {
              "type": "Input.Text",
              "id": "q2",
              "placeholder": "+1 408 526 7209",
              "style": "tel"
            },
            {
              "type": "TextBlock",
              "text": "test"
            },
            {
              "type": "Input.Text",
              "id": "q3",
              "placeholder": "+1 408 526 7209",
              "style": "tel"
            },

          ]
        },
        {
          "type": "Column",
          "width": 1,
          "items": [
            {
              "type": "Image",
              "url": "https://en.meming.world/images/en/b/bc/Mike_Wazowski-Sulley_Face_Swap.jpg",
              "size": "auto"
            }
          ]
        }
      ]
    }
  ],
  "actions": [
    {
      "type": "Action.Submit",
      "title": "Submit",
      "id": "newcardID"
    }
  ]
}
//////////////////////////////////////////////////////////////////end of bs///////////////////////////////////////////////////////////////////////




/* On mention reply example
ex User enters @botname 'reply' phrase, the bot will post a threaded reply
*/
framework.hears('reply', function (bot, trigger) {
  console.log("someone asked for a reply.  We will give them two.");
  responded = true;
  bot.reply(trigger.message,
    'This is threaded reply sent using the `bot.reply()` method.',
    'markdown');
  var msg_attach = {
    text: "This is also threaded reply with an attachment sent via bot.reply(): ",
    file: 'https://media2.giphy.com/media/dTJd5ygpxkzWo/giphy-downsized-medium.gif'
  };
  bot.reply(trigger.message, msg_attach);
});
// FEATURES COMMANDS END


// FEATURES WITH CARDS COMMANDS START
/* On mention with card example
ex User enters @botname 'card me' phrase, the bot will produce a personalized card - https://developer.webex.com/docs/api/guides/cards
*/
framework.hears('card me', function (bot, trigger) {
  console.log("someone asked for a card");
  responded = true;
  let avatar = trigger.person.avatar;

  trigger.person.
    cardJSON.body[0].columns[0].items[0].url = (avatar) ? avatar : `${config.webhookUrl}/missing-avatar.jpg`;
  cardJSON.body[0].columns[0].items[1].text = trigger.person.displayName;
  cardJSON.body[0].columns[0].items[2].text = trigger.person.emails[0];
  bot.sendCard(cardJSON, 'This is customizable fallback text for clients that do not support buttons & cards');
});


// Buttons & Cards data
let cardJSON =
{
  $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
  type: 'AdaptiveCard',
  version: '1.0',
  body:
    [{
      type: 'ColumnSet',
      columns:
        [{
          type: 'Column',
          width: '5',
          items:
            [{
              type: 'Image',
              url: 'Your avatar appears here!',
              size: 'large',
              horizontalAlignment: "Center",
              style: 'person'
            },
            {
              type: 'TextBlock',
              text: 'Your name will be here!',
              size: 'medium',
              horizontalAlignment: "Center",
              weight: 'Bolder'
            },
            {
              type: 'TextBlock',
              text: 'And your email goes here!',
              size: 'small',
              horizontalAlignment: "Center",
              isSubtle: true,
              wrap: false
            }]
        }]
    }]
};

// FEATURES WITH CARDS COMMANDS END

// ERROR HANDLING START

/* On mention with unexpected bot command
   Its a good practice is to gracefully handle unexpected input
*/
framework.hears(/.*/, function (bot, trigger) {
  // This will fire for any input so only respond if we haven't already
  if (!responded) {
    console.log(`catch-all handler fired for user input: ${trigger.text}`);
    bot.say(`Sorry, I don't know how to respond to "${trigger.text}"`)
      //.then(() => sendHelp(bot))
      .then(() => mainmenu(bot))
      .catch((e) => console.error(`Problem in the unexepected command hander: ${e.message}`));
  }
  responded = false;
});
// ERROR HANDLING END

// FUNCTIONS START
function sendHelp(bot) {
  bot.say("markdown", 'These are the commands I can respond to:', '\n\n ' +
    '1. **framework**   (learn more about the Webex Bot Framework) \n' +
    '2. **info**  (get your personal details) \n' +
    '3. **space**  (get details about this space) \n' +
    '4. **card me** (a cool card!) \n' +
    '5. **say hi to everyone** (everyone gets a greeting using a call to the Webex SDK) \n' +
    '6. **reply** (have bot reply to your message) \n' +
    '7. **help** (what you are reading now)');
}

function mainmenu(bot) {
  console.log("INSIDE MAIN MENU FUNCTION");
  bot.say("markdown", 'I can help you... ', '\n\n ' +
    '1. **search**   (Search for product details and location) \n' +
    '2. **lowstock**   (Check what products are low in stock) \n' +
    '3. **createsurvey**   (Leave a feedback to your manager) \n' +
    '4. **feedback**   (Leave a feedback to your manager) \n' +
    '5. **assist**   (We will personally call a staff to assist you) \n' +
    '6. **mainmenu**   (What you see now)'
  );
}
// FUNCTIONS END

/////////////////////// SERVER START /////////////////////// 
//Server config & housekeeping
// Health Check
app.get('/', function (req, res) {
  res.send(`I'm alive.`);
});

app.post('/', webhook(framework));

var server = app.listen(config.port, function () {
  framework.debug('framework listening on port %s', config.port);
});

// gracefully shutdown (ctrl-c)
process.on('SIGINT', function () {
  framework.debug('stoppping...');
  server.close();
  framework.stop().then(function () {
    process.exit();
  });
});
/////////////////////// SERVER END /////////////////////// 

/////////////////////// DB START (like app.js) /////////////////////// 

// db requires
const MySQLStore = require('express-mysql-session');
const db = require('./config/db'); // db.js config file
const cookieParser = require('cookie-parser');
const fypDB = require('./config/DBConnection'); // Bring in database connection
const { getDefaultSettings } = require('http2');
const Bit = require('tedious/lib/data-types/bit');
const { get } = require('express/lib/response');

//SQL EXPORT?? 
// const mysql = require('mysql');
// const excel = require('exceljs');

const session = require('express-session')({
  key: 'tailornow_session',
  secret: 'tojiv',
  store: new MySQLStore({
    host: db.host,
    port: 3306,
    user: db.username,
    password: db.password,
    database: db.database,
    clearExpired: true,
    // How frequently expired sessions will be cleared; milliseconds:
    checkExpirationInterval: 9000000,
    // The maximum age of a valid session; milliseconds:
    expiration: 9000000,
  }),
  resave: false,
  saveUninitialized: false,
});
//const sharedsession = require("express-socket.io-session");

// Enables session to be stored using browser's Cookie ID
app.use(cookieParser);
// app.use(passport.authenticate('RememberMe'));

// To store session information. By default it is stored as a cookie on browser
// so the cookie works here alrdy so how shld i "deactivate" it LOLOLOLOLOLOL 
app.use(session);

// Connects to MySQL database
fypDB.setUpDB(false); // To set up database with new tables set (true)


/////////////////////// DB END (like app.js) /////////////////////// 


