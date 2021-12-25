const gardenFunctions = require("./gardenFunctions.js");
const request = require("request");
const weatherCache = require("./weatherCache.json")
const fs = require('fs');
const creatureUserModel = require('./models/creatureUserSchema');
const guildSettingsModel = require('./models/guildSettingsSchema');
const functions = require("./functions.js");
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const config = require("./config.json");

const butterflies = ["Aurelion", "Basilisk", "Hydrotherma", "Tainted Admiral"]
const colors = ["#d6af3a", "#69c765", "#4681cf", "#d63ad1"]
const links = ["https://imgur.com/YtUQWSY.png", "https://imgur.com/oNlXH3Z.png", "https://imgur.com/Rdlf8jU.png", "https://imgur.com/TWCQazQ.png"] // cant upload file, otherwise it cant be deleted with an edit

// MAIN TIMERS

exports.runTimer = async (client) => {
    updateWeatherCache();

    let seconds = 0;
    let repeatDelay = 20; // in seconds
    setInterval(async function() { 
        seconds += repeatDelay;

        // every minute
        if (seconds % 60 == 0) {
        }
        // every 5 minutes
        if (seconds % 300 == 0) {
            updateWeatherCache();
            await butterflyCheck(client);
        }

        // loop through each user
        creatureUserModel.find({} , (err, users) => {
            if(err) console.log(err);

            users.map(async user => {
                // every 20 seconds
                await checkEggHatching(client, user);
                await clearOldBrews(client, user);
                // every minute
                if (seconds % 60 == 0) {
                    await updateGardenWater(client, user);
                }
                // every 5 minutes
                if (seconds % 300 == 0) {
                }
                user.save();
            });
        });

    }, 1000 * repeatDelay) 
}

// butterflies
async function butterflyCheck(client) {
    guildSettingsModel.find({} , (err, guilds) => {
        if(err) console.error(err);

        guilds.map(async guild => {
            if (Math.random() < 0.05) { // roughly 14 butterflies a day: (1440 / 5) * 0.05
                console.log("attempting butterfly spawn for " + guild.guildID)
                let channel = -1;
                if (guild.settings.eventChannel != -1) channel = guild.settings.eventChannel;
                else if (guild.settings.alertChannel != -1) channel = guild.settings.alertChannel;
                else if (guild.settings.botChannel != -1) channel = guild.settings.botChannel;

                if (channel != -1) {
                    let botC
                    try {
                        botC = await client.channels.fetch(channel.toString());
                    } catch (err) {console.error("error finding channel",err);}

                    if (botC) spawnButterfly(client, botC)
                    else console.error("cant find channel");        
                }           
            }
        });
    });

}
var spawnButterfly = exports.spawnButterfly = async (client, channel) => {
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

    let butterflyMessage = await channel.send({
        embeds: [embedAppear],
        components: [row]
        })
    
    let usersClicked = [];

    const filter = (i) => !usersClicked.includes(i.user.id)
    const collector = channel.createMessageComponentCollector({
        filter,
        time: 3 * 60 * 1000
    })
    collector.on('collect', async i => {
        usersClicked.push(i.user.id);

        let user = await functions.getUser( i.user.id, i.guildId);
        if (!user) return console.error("couldnt find profile for butterfly catch");      
                
        let rewards = functions.chooseButterflyRewards(client,user,true)

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
        user.save();
    });
    collector.on('end', collected => {
        butterflyMessage.edit({embeds: [embedFlyAway], components: [], files: []})
    });  
}
// creatures

async function checkEggHatching(client, user){
    let toRemove = [];
    // loop through each egg
    for (const egg of user.eggs) {
        const userStats = await functions.getUserStats(client, user.userID, user.guildID);
        const speedScale = 1 - (userStats.eggHatchSpeed - 1);
        if ((new Date).getTime() - egg.obtained.getTime() > egg.hatchTime * speedScale) {
            toRemove.push(user.eggs.indexOf(egg));

            functions.addThingToUser(user.creatures, egg.name,1);

            // send notification if enabled
            const time = new Date().addHours(8);
            if (user.settings.eggNotifs && ((time.getHours() >= 21 || time.getHours() <= 7) || user.settings.nightNotifs)) 
                functions.sendAlert(client, `<@!${user.userID}>! your ${egg.name} has hatched!`, user.guildID) 
            
            // log
            let username = client.users.cache.get(user.userID).username;
            if (!username) username = user.userID;
            console.log(`hatched ${username}'s ${egg.name} egg`);
            //logCreatureGame(`hatched ${user.userID}'s ${egg.name} egg. they now have\n`);            
        }
    }
    // remove hatched eggs from egg array
    for (let i = toRemove.length - 1; i >= 0; i--){ // go backwards to not mess up indexing
        if (toRemove[i] > -1) user.eggs.splice(toRemove[i], 1); // removes 1 element from index
    }
}

// brewing

function clearOldBrews(client, user) {
    if (user.brew.started && Date.now() - user.brew.started.getTime() > config.brewExpiry) {
        user.brew.started = null;
        user.brew.steps = [];
        functions.sendAlert(client, `<@!${user.userID}>! your brew has expired D:`, user.guildID) 
    }    
}

// garden

async function updateGardenWater(client, user) {
    for (const plant of user.garden.plants) {
    //for (let i = 0; i < user.garden.plants.length; i++) {
        if (plant.name == "none") continue;
        await gardenFunctions.updatePlantWater(client, user, plant);       
    }
}

// weather

function updateWeatherCache() { 
    const url = 'http://api.openweathermap.org/data/2.5/weather?q=Perth&appid=' + process.env['WEATHERTOKEN'];
    request(url, function(err, response, body) {
        // On return, check the json data fetched
        if (err) {
            console.log(err)
        } else {
            let weather = JSON.parse(body);
            if (weather.main == undefined) console.log("error getting weather")
            else {
                //console.log(weather);
                weatherCache.weather = weather.weather[0].main;  
                weatherCache.temperature = weather.main.temp - 273.15;  
                weatherCache.windspd = weather.wind.speed;  
                weatherCache.clouds = weather.clouds.all;  
                fs.writeFileSync("./weatherCache.json", JSON.stringify(weatherCache));
            }
        }
    });
}