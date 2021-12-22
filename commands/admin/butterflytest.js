const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const functions = require('../../functions.js')

const butterflies = ["Aurelion", "Basilisk", "Hydrotherma", "Tainted Admiral"]
const colors = ["#d6af3a", "#69c765", "#4681cf", "#d63ad1"]
const links = ["https://imgur.com/YtUQWSY.png", "https://imgur.com/oNlXH3Z.png", "https://imgur.com/Rdlf8jU.png", "https://imgur.com/TWCQazQ.png"] // cant upload file, otherwise it cant be deleted with an edit

module.exports = {
    name: 'butterflytest',
    description: 'add to the todo list',
    usage: "%PREFIX%butterflytest",
    admin: true,
    async execute(client, message, args, Discord){
        const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('start')
                        .setEmoji('🦋')
                        .setLabel('catch butterfly!')
                        .setStyle('PRIMARY')
                )
        
        const choice = Math.floor(Math.random() * butterflies.length);
        const butterfly = butterflies[choice];

        const embedAppear = new MessageEmbed()
            .setColor(colors[choice])
            .setTitle("butterfly!")
            .setDescription(`✨ a ${butterfly} butterfly has appeared ✨`)
            .setImage(links[choice]);

        const embedFlyAway = new MessageEmbed()
            .setColor('#666c73')
            .setTitle("butterfly...")
            .setDescription(`the butterfly has flown away :(`);

        let butterflyMessage = await message.channel.send({
            embeds: [embedAppear],
            components: [row]
            })
        
        let usersClicked = [];

        const filter = (i) => !usersClicked.includes(i.user.id)
        const collector = message.channel.createMessageComponentCollector({
            filter,
            time: 60 * 1000
        })
        collector.on('collect', async i => {
            usersClicked.push(i.user.id);

            let user = await functions.getUser( message.author.id, message.guild.id);
            if (!user) return message.channel.send("can't find profile");      
                  
            let rewards = functions.chooseButterflyRewards(client,user,false)

            let rewardString = "";
            for (item of rewards.itemRewards) {
                let emoji = functions.getEmojiFromName(client, item.name);
                if (emoji == '❌') emoji = '';
                rewardString += `${emoji}${item.name} **x${item.count}**\n`;
            }
            if (rewards.flarinReward > 0) { 
                let flarinEmoji = functions.getEmojiFromName(client, "flarin");
                rewardString += `${rewards.flarinReward}${flarinEmoji}\n`;
            }

            const embed = new MessageEmbed()
                .setColor('#69c765')
                .setTitle("you caught a butterfly!")
                .setDescription(rewardString);

            i.reply({ embeds: [embed], ephemeral: true })
        });
        collector.on('end', collected => {
            butterflyMessage.edit({embeds: [embedFlyAway], components: [], files: []})
        });   
    }
}   