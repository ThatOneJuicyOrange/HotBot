const creatureUserModel = require('../../models/creatureUserSchema');
const { MessageEmbed } = require('discord.js');
const functions = require('../../functions.js')

module.exports = {
    name: 'giveegg',
    description: 'give someone an egg',
    usage: "!giveegg [user] [egg name]",
    admin: true,
    async execute(client, message, args, Discord){  
        let user = await functions.getUser( message.author.id, message.guild.id);
        if (!user) return message.channel.send("can't find profile");

        const egg = client.creatures.get(args[1]);

        if (!egg) return console.log("couldnt find egg");

        const eggData = {name : args[1], obtained : new Date(), hatchTime : egg.hatchTime }
        creatureUserData.eggs.push(eggData);
        creatureUserData.save();
    }
}   