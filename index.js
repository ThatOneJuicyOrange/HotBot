var path = require('path');
global.appRoot = path.resolve(__dirname);
global.src = global.appRoot + "/src";

require('./src/extensions.js')
const Discord = require('discord.js');
const keepAlive = require('./src/server');
const mongoose = require('mongoose');
const timerFunctions = require('./src/functions/timerFunctions.js');
const fs = require('fs');
require('dotenv').config() // remove in replit..?

const Canvas = require('canvas');
Canvas.registerFont('./src/fonts/Notalot60.ttf', { family: 'Notalot60' });

const client = new Discord.Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    intents: [
        'GUILDS',
        'GUILD_MESSAGES',
        'GUILD_MEMBERS',
        'GUILD_EMOJIS_AND_STICKERS',
        'GUILD_PRESENCES',
        'GUILD_MESSAGE_REACTIONS'
    ]
});

// more collections are defined in itemHandler
client.commands = new Discord.Collection();
client.events = new Discord.Collection();
client.creatures = new Discord.Collection();
client.fish = new Discord.Collection();
client.prefixes = new Discord.Collection();

const handlers = fs.readdirSync('./src/handlers').filter(file => file.endsWith('.js'));
for (handler of handlers)
    require(`./src/handlers/${handler}`)(client, Discord);

keepAlive();

timerFunctions.runTimer(client);

mongoose
    .connect(
        process.env['DBTOKEN'],
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        }
    )
    .then(() => {
        console.log('located the juice');
        //monitor()
        
    })
    .catch(err => {
        console.log(err);
    });

//client.on('debug', console.log);
client.on('rateLimit', info => {
    console.log(
        `Rate limit hit ${
        info.timeDifference
            ? info.timeDifference
            : info.timeout
                ? info.timeout
                : 'Unknown timeout '
        }`)
});
client.login(process.env['TOKEN']); // keep at end