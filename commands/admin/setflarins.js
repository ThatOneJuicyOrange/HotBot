const creatureUserModel = require('../../models/creatureUserSchema');
const { MessageEmbed } = require('discord.js');
const functions = require('../../functions.js')

module.exports = {
    name: 'setflarins',
    description: 'set someones flarins',
    usage: "!setflarins <user id> <amount>",
    admin: true,
    async execute(client, message, args, Discord){  
        let user = await functions.getUser( message.author.id, message.guild.id);
        if (!user) return message.channel.send("can't find profile");

        user.flarins = parseInt(args[1]);
        user.save();
    }
}   