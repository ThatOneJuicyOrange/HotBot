const Canvas = require('canvas');
Canvas.registerFont('./fonts/Notalot60.ttf', { family: 'Notalot60' });
const { MessageAttachment, MessageEmbed } = require('discord.js');
const creatureUserModel = require('../../models/creatureUserSchema');
const config = require("../../config.json");
const gardenFunctions = require('../../gardenFunctions.js')
const functions = require('../../functions.js')

module.exports = {
    name: 'garden',
    description: 'view garden',
    usage: `%PREFIX%garden\n`
        + `%PREFIX%garden details`,
    async execute(client, message, args, Discord){
        let user = await functions.getUser( message.author.id, message.guild.id);
        if (!user) return message.channel.send("can't find profile");
 
        gardenFunctions.fixDefaultGarden(user);

        user.save();

        const userStats = await functions.getUserStats(client, message.author.id, message.guild.id);
        let growthMultiplier = 1 - (userStats.gardenGrowthRate - 1);
        let waterMultiplier = 1 + (1 -userStats.gardenWaterNeed);

        if (args[0] == "details") {
            let plantList = "";
            for(let i = 0; i < userStats.gardenPlots; i++) {
                let plant = user.garden.plants[i];
                let plantData = client.plants.get(plant.name);
                let t = "`";
                plantList += `${t}plot ${i + 1}: ${plant.name}${t}\n`
                if (plantData) {
                    waterLevel = Math.clamp(1 - ((Date.now() - plant.lastWatered.getTime()) / (plantData.waterRate * waterMultiplier)),0, 1)
                    let grownMs = ((plantData.growTime - (Date.now() - plant.planted)) + plant.timeUnwatered) * growthMultiplier;
                    let grownTime = new Date(grownMs).toCountdown();
                    if (grownMs < 0) grownTime = "grown!";

                    plantList += `🌿**time until grown:** ${grownTime}\n`
                                + `💧**water level:** ${(waterLevel * 100).toFixed(2)}%\n`
                                + `🍂**dehydration:** ${new Date(plant.timeUnwatered).toCountdown()}\n`;
                }                
            }
            if (plantList == "") plantList = "error";

            let gardenUpgrades = ["Better Equipment", "Sprinkler", "Fertilizer"]
            let upgradeList = "";
            for (const upgrade of user.upgrades) {
                if (!gardenUpgrades.includes(upgrade.name)) continue;
                let upgradeData = client.upgrades.get(upgrade.name);
                if (!upgradeData) {console.log(`couldnt find ${upgrade.name} data`); continue;}
                upgradeList += `**${upgradeData.name}** x${upgrade.count}
                                ❓${upgradeData.effect}\n`
            }

            const embed = new MessageEmbed()
            .setColor('#63e674')
            .setTitle(message.author.username + "'s garden")
            if(upgradeList != "") embed.addField("upgrades", upgradeList);
            embed.addField("plants", plantList);
            message.channel.send({ embeds: [embed] });
        }
        else {
            const canvas = Canvas.createCanvas(346, 200);
            const context = canvas.getContext('2d');
            const garden = await Canvas.loadImage('./garden/GardenBase.png');
            const plot = await Canvas.loadImage('./garden/Plot.png');
            const bars = await Canvas.loadImage('./garden/Bars.png');

            context.drawImage(garden, 0, 0, canvas.width, canvas.height);
            for (let layer = 0; layer < 3; layer++) {
                let plotX = 30;
                let plotY = 58;
                for (let i = 0; i < userStats.gardenPlots; i++) {
                    let plant = user.garden.plants[i];
                    let plantData = client.plants.get(plant.name); // will be undefined if no plant
                    if (layer == 0) {
                        // plot
                        context.drawImage(plot, plotX, plotY, 84, 44);
                        // plant
                        if (plantData){
                            let plantFileName = plant.name.split(' ').join(''); // remove all spaces
                            const plantTex = await Canvas.loadImage(`./garden/plants/${plantFileName}.png`);
                            context.drawImage(plantTex, plotX, plotY - 14, 84, 58);
                        }
                        else if(plant.name != "none"){
                            context.font = '15px Notalot60';
                            context.fillStyle = '#ffffff';
                            context.fillText(plant.name, plotX + 30, plotY + 20);    
                        }          
                    }
                    else if (layer == 1 && plantData) {
                        let barLocX = 8;
                        let barLocY = 38;

                        waterLevel = 1 - ((Date.now() - plant.lastWatered.getTime()) / (plantData.waterRate * waterMultiplier))

                        // bars
                        context.drawImage(bars, plotX + barLocX, plotY + barLocY, 24, 14);
                        // water
                        context.fillStyle = '#639bff';
                        let waterBarSize = Math.clamp(20 * waterLevel, 0, 20);
                        context.fillRect(plotX + barLocX + 2, plotY + barLocY + 2, waterBarSize, 4);
                        // growth
                        context.fillStyle = '#99e550';
                        let growthBarSize = Math.clamp(20 * ((((Date.now() - plant.planted) - plant.timeUnwatered) * growthMultiplier) / plantData.growTime),0, 20);
                        context.fillRect(plotX + barLocX + 2, plotY + barLocY + 8, growthBarSize, 4);
                    }

                    plotX += 36;
                    plotY += 18;
                    if (i == 3) {
                        plotX = 120;
                        plotY = 12;
                    }
                }
            }

            const attachment = new MessageAttachment(canvas.toBuffer(), 'garden.png');

            message.channel.send({ files: [attachment] });
        }
    }
}   