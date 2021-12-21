const creatureUserModel = require('../../models/creatureUserSchema');
const { MessageEmbed } = require('discord.js');
const functions = require('../../functions.js');

module.exports = {
    name: 'upgrades',
    description: 'view your upgrades',
    usage: "!upgrades",
    async execute(client, message, args, Discord){          
        let user = await functions.getUser( message.author.id, message.guild.id);
        if (!user) return message.channel.send("can't find profile");

        let upgradeList = "";

        for (const upgrade of user.upgrades) {
            let upgradeData = client.upgrades.get(upgrade.name);
            if (!upgradeData) {console.log(`couldnt find ${upgrade.name} data`); continue;}
            upgradeList += `**${upgradeData.name}** x${upgrade.count}
                            ❓${upgradeData.effect}\n`
        }

        if (upgradeList == "") upgradeList = "none";
        const embed = new MessageEmbed()
            .setColor('#e676e8')
            .setTitle(message.author.username + "'s upgrades")
            .addField("upgrades", upgradeList, true);
        message.channel.send({ embeds: [embed] });
    }
}   