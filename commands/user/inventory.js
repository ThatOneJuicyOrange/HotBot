const creatureUserModel = require('../../models/creatureUserSchema');
const { MessageEmbed } = require('discord.js');
const functions = require('../../functions.js');

module.exports = {
    name: 'inventory',
    description: 'view your inventory',
    usage: "!inventory",
    async execute(client, message, args, Discord){          
        let user = await functions.getUser(message.author.id, message.guild.id);
        if (!user) return message.channel.send("can't find profile");

        const embed = new MessageEmbed()
            .setColor('#f0c862')
            .setTitle(message.author.username + "'s inventory")
            .setDescription("do **!seeds** to view more details on your seeds")

        for (const [key, value] of Object.entries(user.inventory)) {
            if (key == "fish") continue;
            let invText = "";
            for (const item of user.inventory[key]){
                let itemEmoji = functions.getEmojiFromName(client, item.name);
                if (itemEmoji == '❌') itemEmoji = "";
                 invText += `${itemEmoji}**${item.name}** x${item.count}\n`
            }
            embed.addField(key, invText == "" ? "none" : invText, true);
        }
        message.channel.send({ embeds: [embed] });
    }
}   