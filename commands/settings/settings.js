const creatureUserModel = require('../../models/creatureUserSchema');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'settings',
    description: 'view/change your user settings',
    usage: "%PREFIX%settings <setting> <value>",
    async execute(client, message, args, Discord){       
        let user = await functions.getUser( message.author.id, message.guild.id);
        if (!user) return message.channel.send("can't find profile");
        
        if (args[0]){
            if (user.settings[args[0]] === undefined) return message.channel.send("i cant find that setting");
            // change setting
            if (args[1]){
                if (typeof user.settings[args[0]] == "boolean") {
                    if (args[1].toLowerCase() == "false") user.settings[args[0]] = false;
                    else if (args[1].toLowerCase() == "true") user.settings[args[0]] = true;
                    else return message.channel.send("incorrect data type, please enter " + typeof user.settings[args[0]]);
                }
                else if (typeof user.settings[args[0]] == "number") {
                    if (!isNaN(Number(args[1]))) user.settings[args[0]] = Number(args[1]);
                    else return message.channel.send("incorrect data type, please enter " + typeof user.settings[args[0]]);
                }
                if (typeof user.settings[args[0]] == "string") 
                    user.settings[args[0]] = args[1];
                user.save();
                message.channel.send(args[0] + " updated to " + args[1])
            }
            // view setting
            else {
                const embed = new MessageEmbed()
                .setColor('#f0c862')
                .setTitle(message.author.username + "'s settings")
                .addField(args[0],  user.settings[args[0]], true);
                message.channel.send({embeds: [embed]});
            }
        }
        // list settings
        else {
            let settingsText = "";
            for (const [setting, value] of Object.entries(user.settings)) 
                settingsText += `**${setting}**: ${user.settings[setting]}\n`;

            
            const embed = new MessageEmbed()
                .setColor('#f0c862')
                .setTitle(message.author.username + "'s settings")
                .addField("settings", settingsText, true);
            message.channel.send({embeds: [embed]});
        }
    }
}