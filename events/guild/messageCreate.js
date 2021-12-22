const functions = require('../../functions.js')
const cf = require('../../creatureFunctions.js')
const fs = require('fs');
const config = require("../../config.json");
const guildSettingsModel = require('../../models/guildSettingsSchema');

module.exports = async (Discord, client, message) => {
    let prefix = functions.getPrefix(client, message.guildId);

    // record to log 
    //functions.recordMessage(Discord, client, message);
    
    // egg stuff 
    if(!message.author.bot && config.fullAccess.includes(message.guild.id)) cf.checkEgg(Discord, client, message);

    // responses   
    if (message.content.toLowerCase().startsWith("marco") &&
        Math.floor(Math.random() * 5) == 0) return message.channel.send("polo from :sparkles:the internet:sparkles:");

    // commands
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/); // splits the commands at the spaces eg !dig potato > "dig", "potato"
    const cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd);
    if (!command) return message.reply("i don't know that command :(");

    if (command.admin && message.author.id != '283182274474672128' && message.author.id != '902830379629707314') return;
    
    if (!command.universal && !config.fullAccess.includes(message.guild.id)) return;

    try {
        command.execute(client, message, args, Discord);
    } 
    catch (err){
        message.reply("error executing command. sorry lmao can't code.");
        console.log(err);
    }
}
