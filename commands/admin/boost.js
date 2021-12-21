const creatureUserModel = require('../../models/creatureUserSchema');
const { MessageEmbed } = require('discord.js');
const functions = require('../../functions.js')

module.exports = {
    name: 'boost',
    description: 'give someone a boost',
    usage: "!boost <user id> <boost name>",
    admin: true,
    async execute(client, message, args, Discord){  
        let user = await functions.getUser( message.author.id, message.guild.id);
        if (!user) return message.channel.send("can't find profile");

        let boostName = args[1];
        for (let i = 2; i < args.length; i++) boostName += " " + args[i] ;

        if (client.boosts.get(boostName)) return message.channel.send("that boost doesnt exist");

        if(functions.addBoost(client, user, boostName)) message.channel.send("boost added!")
        else message.channel.send("boost not added");
        user.save();
    }
}   