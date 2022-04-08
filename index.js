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
    var msg = 'what do you want to do today? You can say `mainmenu` to get the list of words I am able to respond to.';
    bot.webex.people.get(actorId).then((user) => {
      msg = `Hello there ${user.displayName}. ${msg}` 
      
      console.log("here? no way");
    }).catch((e) => {
      //console.error(`Failed to lookup user details in framwork.on("spawn"): ${e.message}`);
      msg = `Hello, ${msg}`;  
      
    }).finally(() => {
      // Say hello, and tell users what you do!
      if (bot.isDirect) {
        bot.say('markdown', msg);
      } else {
        let botName = bot.person.displayName;
        msg += `\n\nDon't forget, in order for me to see your messages in this group space, be sure to *@mention* ${botName}.`;
        bot.say('markdown', msg);
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

// framework.hears('locate', function (bot) {
//   console.log("INSIDE LOCATE: framework command received");
//   responded = true;
//   bot.say("markdown", "im inside locate now. ")
//   .then(() => executeStatement(bot));
// });

//product search to see how to store and retrieve from database

framework.hears(/search/i, function (bot, trigger) {
  console.log("this is inside search.");
  responded = true;
  bot.reply(trigger.message, 
    'What product are you searching for? Please reply with product code. (eg. `1001`)',
    'markdown')
    .then(() => searchcode(bot));
    // var regexpdcode = "/[1-9][0-9]{3}/";
    // if (framework.hears(regexpdcode) == true) {
    //   console.log("REGEX RIGHT")
    // } if (framework.hears(regexpdcode) == false) {
    //   console.log("REGEX WRONG")
    // }
  bot.reply(trigger.message);
});

function searchcode() {
  framework.hears(/[1-9][0-9]{3}/i, function (bot, trigger) {
    console.log("number regex i      regex." );
    responded = true;
    bot.reply(trigger.message, 'Searching for product...','markdown');
    //bot.listen()
    // Product.findAll({
    //   where: 
    // })
    bot.reply(trigger.message);
  });
}


framework.hears('framework', function (bot) {
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
framework.hears("say hi to everyone", function (bot) {
  console.log("say hi to everyone.  Its a party");
  responded = true;
  // Use the webex SDK to get the list of users in this space
  bot.webex.memberships.list({roomId: bot.room.id})
    .then((memberships) => {
      for (const member of memberships.items) {
        if (member.personId === bot.person.id) {
          // Skip myself!
          continue;
        }
        let displayName = (member.personDisplayName) ? member.personDisplayName : member.personEmail;
        bot.say(`Hello ${displayName}`);
      }
    })
    .catch((e) => {
      console.error(`Call to sdk.memberships.get() failed: ${e.messages}`);
      bot.say('Hello everybody!');
    });
});

//////////////////////////////////////////////////////////START OF bs FORM//////////////////////////////////////////////////////////////////////////////////
framework.hears('card', function (bot, trigger) {
  console.log("someone asked for a card");
  responded = true;
  bot.sendCard(newcardJSON, 'This is customizable fallback text for clients that do not support buttons & cards');
});
// process a submitted card////
framework.on('attachmentAction', function (bot, trigger) {
  // bot.say(`Got an attachmentAction:\n${JSON.stringify(trigger.attachmentAction,null,2)}`);///
  bot.reply(trigger.attachmentAction, 'Your response has been recorded :)))');
  console.log("someone submitted a survey" + trigger.attachmentAction);
  var response = trigger.attachmentAction
  var responseStr = JSON.stringify(response)
  var responseObj = JSON.parse(responseStr)
  var responseInput = responseObj.inputs
  // console.log(responseInput)
  Survey.create(responseInput).then((survey) => {
    bot.say("saved into db frfr");
  })
});
 
 
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
      "title": "Submit"
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


