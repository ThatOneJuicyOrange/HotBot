const guildSettingsModel = require('../../models/guildSettingsSchema');
const { MessageEmbed, Permissions  } = require('discord.js');

module.exports = {
    name: 'guildsettings',
    description: 'view/change your guild settings',
    usage: "%PREFIX%guildsettings <setting> <value>",
    async execute(client, message, args, Discord){       
        if(!message.member.permissions.has(Permissions.ADMINISTRATOR)) 
            return message.channel.send("you arent an admin :(");

        let guild;
        try {
            const filter = { guildID: message.guild.id }
            guild = await guildSettingsModel.findOne(filter);

            // create profile if it doesnt exist
            if (guild == null){
                guild = await guildSettingsModel.create({
                    guildID: message.guild.id
                });
            }
        }
        catch (err) { console.log(err); }
        if (!guild) return message.channel.send("error getting profile :(");
        
        if (args[0]){
            if (!guild.settings[args[0]] === undefined) return message.channel.send("i cant find that setting");
            // change setting
            if (args[1]){
                
                if (typeof guild.settings[args[0]] == "boolean") {
                    if (args[1].toLowerCase() == "false") guild.settings[args[0]] = false;
                    else if (args[1].toLowerCase() == "true") guild.settings[args[0]] = true;
                    else return message.channel.send("incorrect data type, please enter " + typeof guild.settings[args[0]]);
                }
                else if (typeof guild.settings[args[0]] == "number") {
                    if (!isNaN(Number(args[1]))) guild.settings[args[0]] = Number(args[1]);
                    else return message.channel.send("incorrect data type, please enter " + typeof guild.settings[args[0]]);
                }
                if (typeof guild.settings[args[0]] == "string") 
                    guild.settings[args[0]] = args[1];

                if (args[0] == "prefix") 
                    client.prefixes.set(message.guildId,args[1])         

                message.channel.send(args[0] + " updated to " + args[1])
            }
            // view setting
            else {
                const embed = new MessageEmbed()
                .setColor('#f0c862')
                .setTitle(message.guild.name + "'s settings")
                .addField(args[0],  guild.settings[args[0]], true);
                message.channel.send({embeds: [embed]});
            }
        }
        // list settings
        else {
            let settingsText = "";
            for (const [setting, value] of Object.entries(guild.settings))
                settingsText += `**${setting}**: ${guild.settings[setting]}\n`;

            
            const embed = new MessageEmbed()
                .setColor('#f0c862')
                .setTitle(message.guild.name + "'s settings")
                .addField("settings", settingsText, true);
            message.channel.send({embeds: [embed]});
        }
        guild.save();
    }
}