const Discord = require('discord.js');
const keepAlive = require('./server');
const mongoose = require('mongoose');
const functions = require('./functions.js');
const timerFunctions = require('./timerFunctions.js');
const fs = require('fs');
const ms = require('ms');
var path = require('path');
global.appRoot = path.resolve(__dirname);

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

// extends Map
client.commands = new Discord.Collection();
client.events = new Discord.Collection();
client.creatures = new Discord.Collection();
client.fish = new Discord.Collection();
// more are defined in itemHandler

const handlers = fs.readdirSync('./handlers').filter(file => file.endsWith('.js'));
for (handler of handlers)
    require(`./handlers/${handler}`)(client, Discord);

/*['commandHandler', 'eventHandler', 'creatureHandler', 'fishHandler', 'itemHandler'].forEach(
	handler => {
		require(`./handlers/${handler}`)(client, Discord);
	}
);*/

keepAlive();

//functions.checkEggHatching(Discord, client);
//timerFunctions.timer5Mins(Discord, client);
//timerFunctions.timer1Min(Discord, client);
//timerFunctions.timer20Secs(Discord, client);

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