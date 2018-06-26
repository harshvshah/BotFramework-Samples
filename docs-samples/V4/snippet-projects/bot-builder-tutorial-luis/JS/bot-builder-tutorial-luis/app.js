const { BotFrameworkAdapter, MemoryStorage, ConversationState } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const restify = require('restify');

// Replace this appId with the ID of the app you create from cafeLUISModel.json
const appId = "edaadd9b-b632-4733-a25c-5b67271035dd";
// const appId = process.env.LUIS_APP_ID; // edaadd9b-b632-4733-a25c-5b67271035dd
// Replace this with your authoring key
const subscriptionKey = "be30825b782843dcbbe520ac5338f567";
console.log(`LUIS app ID=${appId}, key=${subscriptionKey}`);
// const subscriptionKey = process.env.LUIS_SUBSCRIPTION_KEY; // be30825b782843dcbbe520ac5338f567
// console.log(`process.env.LUIS_APP_ID=${process.env.LUIS_APP_ID}, process.env.LUIS_SUBSCRIPTION_KEY=${process.env.LUIS_SUBSCRIPTION_KEY}`);
// Default is westus
const serviceEndpoint = 'https://westus.api.cognitive.microsoft.com';

const luisRec = new LuisRecognizer({
    appId: appId,
    subscriptionKey: subscriptionKey,
    serviceEndpoint: serviceEndpoint
});

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter
const adapter = new BotFrameworkAdapter({ 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD 
});

// Add conversation state middleware
const conversationState = new ConversationState(new MemoryStorage());
adapter.use(conversationState);

// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, async (context) => {
        if (context.activity.type === 'message') {
            const state = conversationState.get(context);
            const count = state.count === undefined ? state.count = 0 : ++state.count;
            
            // Call LUIS
            
            await luisRec.recognize(context).then(async (res) => 
                {                  
                    let topIntent = LuisRecognizer.topIntent(res);    
                    switch (topIntent)
                    {
                        case "Book_Table": {
                            await context.sendActivity("Top intent is Book_Table ");                          
                            //await dc.begin('reserveTable', res);
                            break;
                        }
                        
                        case "Greeting": {
                            await context.sendActivity("Top intent is Greeting");
                            break;
                        }
    
                        case "Who_are_you_intent": {
                            await context.sendActivity("Top intent is Who_are_you_intent");
                            break;
                        }
                        default: {
                            await context.sendActivity(`Top intent = ${topIntent}`);
                            // await dc.begin('default', topIntent);
                            break;
                        }
                    }
    
                }, (err) => {
                    // error calling LUIS recognize
                    console.log(err);
                }); 


        } else {
            await context.sendActivity(`[${context.activity.type} event detected]`);
        }
    });
});