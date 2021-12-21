const creatureUserModel = require('../../models/creatureUserSchema');
const { MessageEmbed } = require('discord.js');
const functions = require('../../functions.js')

module.exports = {
    name: 'givecreature',
    description: 'give someone a creature',
    usage: "!givecreature [user] [name] [count]",
    admin: true,
    async execute(client, message, args, Discord){  
        let user = await functions.getUser( message.author.id, message.guild.id);
        if (!user) return message.channel.send("can't find profile");
        
        if (!args[2]) return console.log("specify count");

        functions.addThingToUser(user.creatures, args[1], parseInt(args[2]));
        creatureUserData.save();
    }
}   