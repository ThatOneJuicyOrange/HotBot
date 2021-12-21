const creatureUserModel = require('../../models/creatureUserSchema');
const { MessageEmbed } = require('discord.js');
const functions = require('../../functions.js')

module.exports = {
    name: 'giveitem',
    description: 'give someone an item',
    usage: "!giveitem [user] [subinv] [name] [count]",
    admin: true,
    async execute(client, message, args, Discord){  
        if (!args[3]) return message.channel.send("incorrect usage");
        
        let user = await functions.getUser( message.author.id, message.guild.id);
        if (!user) return message.channel.send("can't find profile");

        if(!user.inventory[args[1]]) return message.channel.send('that subinv doesnt exist')

        functions.addThingToUser(user.inventory[args[1]], args[2], args[3]);
        user.save()

        message.channel.send(`given ${args[0]} ${args[3]} ${args[2]}`)
    }
}   