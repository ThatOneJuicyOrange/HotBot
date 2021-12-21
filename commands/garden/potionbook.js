const creatureUserModel = require('../../models/creatureUserSchema');
const config = require("../../config.json");
const functions = require('../../functions.js')
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
    name: 'potionbook',
    description: 'water a plant',
    usage: "!potionbook page",
    admin: true,
    async execute(client, message, args, Discord){
        let maxPages =  3;
        let page = 1;
        if (!isNaN(parseInt(args[0]))) page = parseInt(args[0]);
        if (page > maxPages) page = maxPages;

        let buttons = [];

        for (let i = 1; i <= maxPages; i++) {
            buttons.push(new MessageButton()
                    .setCustomId(`${i}`)
                    .setLabel('page ' + i)
                    .setStyle('PRIMARY')
            )
        }

        const row = new MessageActionRow()
        for (let i = 0; i < buttons.length; i++) {
            if(i != page - 1) row.addComponents(buttons[i].setDisabled(false))
            else row.addComponents(buttons[i].setDisabled(true))
        }

        const embed1 = new MessageEmbed()
            .setColor('#80ede6')
            .setTitle("the potion book: page 1")
            .addField("method", "yeet", true)

        const embed2 = new MessageEmbed()
            .setColor('#80ede6')
            .setTitle("the potion book: page 2")
            .addField("BRUH", "yote", true)

        const embed3 = new MessageEmbed()
            .setColor('#80ede6')
            .setTitle("the potion book: page 3")
            .addField("shheheeh", "aaaaa", true)

        eval(`var embed = embed${page}`); // eval turns a string into js

        let book = await message.channel.send({
            embeds: [embed], 
            components: [row]
        });
        console.log(book);
        const filter = (i) => i.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({
            filter,
            idle: 60 * 1000
        })
        collector.on('collect', i => {  
            page = i.customId;
            const row = new MessageActionRow()
            for (let i = 0; i < buttons.length; i++) {
                if(i != page - 1) row.addComponents(buttons[i].setDisabled(false))
                else row.addComponents(buttons[i].setDisabled(true))
            }

            eval(`var embed = embed${i.customId}`);
            i.message.edit({
                embeds: [embed], 
                components: [row]
            });

            i.deferUpdate(); 
        });   
        collector.on('end', collected => book.edit({content: "potion book closed", embeds: [], components: []}));   
    }
}   