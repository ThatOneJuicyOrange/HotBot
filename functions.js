const { MessageEmbed } = require('discord.js');
var fs = require('fs');
const creatureUserModel = require('./models/creatureUserSchema');
const guildSettingsModel = require('./models/guildSettingsSchema');
const warehouses = ['907483410258337803','907492571503292457', '862206016510361600', '917654307648708609']
const config = require("./config.json");
const seedrandom = require('seedrandom');
const weather = require("./weatherCache.json");
const creatureFunctions = require("./creatureFunctions.js");
const gardenFunctions = require("./gardenFunctions.js");


exports.getUser = async (userID, guildID) => {
    let user;
    try {  user = await creatureUserModel.findOne({ userID: userID, guildID: guildID }); }
    catch (err) { console.log(err); }
    return user;
}

exports.managePlanReactions = async(reaction) => {
    let can = cant = maybe = '';

    for await (const [react, reactValue] of reaction.message.reactions.cache) {
        const users = await reactValue.users.fetch();
        for await (const [user, userValue] of users) {
            if (!userValue.bot) {
                if (react == '👍') can += userValue.toString() + "\n";
                else if (react == '👎') cant += userValue.toString() + "\n";
                else if (react == '🤷') maybe += userValue.toString() + "\n";
            }
        }
    }

    if (can == '') can = 'no one :(';
    if (cant == '') cant = 'no one :)';
    if (maybe == '') maybe = 'no one :)';

    console.log("updated availabilities on: " + reaction.message.id)

    const oldEmbed = reaction.message.embeds[0];
    const embed = new MessageEmbed()
        .setColor(oldEmbed.color)
        .setTitle(oldEmbed.title)
        .addField("can go", can, true)
        .addField("can't go", cant, true)
        .addField("perhaps", maybe, true)
        .setFooter("id: " + reaction.message.id)
    await reaction.message.edit({embeds: [embed]});
}

// this feels like the worst way to do this lmao
var getUserStats = exports.getUserStats = async(client, userID, guildID) => {

    let statObject = { 
        eggChance: config.eggChance, eggChanceText: `Base ${config.eggChance * 100}%\n`,
        eggCD: config.eggMsgCD, eggCDText: `Base ${config.eggMsgCD} minutes\n`,
        eggSlots: 3, eggSlotsText: "Base 3\n",
        eggHatchSpeed: 1, eggHatchSpeedText: "Base 100%\n",
        fishChance: config.fishChance, fishChanceText: `Base ${config.fishChance * 100}%\n`,
        bonusFishChance: 0, bonusFishChanceText: `Base 0%\n`,
        rareFishScale: 0, rareFishScaleText: `Base 0%\n`,
        chestChance: config.chestChance, chestChanceText: `Base ${config.chestChance * 100}%\n`,
        artifactChance: config.artifactChance, artifactChanceText: `Base ${config.artifactChance * 100}%\n`,
        gardenPlots: 2, gardenPlotsText: `Base 3\n`,
        gardenGrowthRate: 1, gardenGrowthRateText: `Base 100%\n`,
        gardenWaterNeed: 1, gardenWaterNeedText: `Base 100%\n`
    };

    if (userID == '283182274474672128') {
        //statObject.chestChance = 0.7;
    }

    const filter = { userID: userID, guildID: guildID }
    let user = await creatureUserModel.findOne(filter);
    if (!user) return console.log("error getting profile for stats");

    clearFinishedBoosts(client, user);

    // boooosts
    for (const boost of user.boosts) {
        let boostData = client.boosts.get(boost.name);
        if (!boostData) boostData = client.potions.get(boost.name);
        if (!boostData) {console.log(`couldnt find ${boost.name} data`); continue;}
        if (Date.now() - boost.used < boostData.duration) {
            boostData.updateStats(statObject);
        }
    }
    // upgrades
    for (const upgrade of user.upgrades) {
        let upgradeData = client.upgrades.get(upgrade.name);
        if (!upgradeData) {console.log(`couldnt find ${upgrade.name} data`); continue;}
        upgradeData.updateStats(statObject, upgrade.count);    
    }
    // bait
    let bait = user.baitEquipped;
    if (!bait) bait = "none";
    if (bait != "none") {
        let baitData = client.bait.get(bait);
        if (baitData) baitData.updateStats(statObject);
        else console.log(`couldnt find ${bait}`)
    }

    // hotness
    let hotnessEffect = (getHotness(userID) - 10) / 100;
    if (hotnessEffect != 0) {
        statObject.eggChance += hotnessEffect;
        statObject.eggChanceText += `hotness: ${hotnessEffect * 100}%\n`;
    }
    user.save(); // save cleared boosts
    return statObject;
}

var userHasBoost = exports.userHasBoost = (user, boostName) => {
    for (const boost of user.boosts) {
        if (boost.name == boostName) return true;
    }
    return false;
}
var userHasUpgrade = exports.userHasUpgrade = (user, upgradeName) => {
    for (const upgrade of user.upgrades) {
        if (upgrade.name == upgradeName) return true;
    }
    return false;
}
exports.isRaining = (user) => {
    let rainCaster = false;
    if (user) rainCaster = userHasBoost(user, "Raincaster");
    return weather.weather == "Rain" || weather.weather == "Drizzle" || rainCaster;
}

exports.getUpgradeCount = (user, upgradeName) => {
    for (const upgrade of user.upgrades) 
        if (upgrade.name == upgradeName) return upgrade.count;
}

var getHotness = exports.getHotness = (userID, prevDay) => {
    let day = Math.trunc((Date.now() + 28800000) / 86400000); // 28800000 is adding 8 hours because timezone
    if (prevDay) day = Date.parseWADate(prevDay);

    var rng = seedrandom(userID + day); // id + days since epoch
    var max = 13;
    var min = 7;   

    return Math.floor(rng() * (max - min) + min);
}

exports.getItem = (client, nameToFind) => {
    for (const itemType of client.items) 
        for (const [itemName, item] of client[itemType]) 
            if (item.name == nameToFind) return item;
}

let emojiCache = new Map();
exports.getEmojiFromName = (client, name) => {
    name = name.split(' ').join(''); // replace only removes the first occurance without regex for some reason
    let emojiFromCache = emojiCache.get(name);
    if (emojiFromCache) return emojiFromCache;

    let emojiToReturn;
    for (const [id, emoji] of client.emojis.cache) {
        // only in hotbots hollow so no one can add random emojis and fuck it
        if (emoji.name == name && warehouses.includes(emoji.guild.id)) {
            emojiToReturn = emoji;
            emojiCache.set(name, emoji);
            break;
        }
    }
    if (!emojiToReturn) emojiToReturn = '❌'; // if none found
    return emojiToReturn;
}

exports.pickFromWeightedMap = (map) => {
    if (map.size == 0) { console.log("no options available"); return; }

    let weightSum = 0.0;
    for (const [key, weight] of map) weightSum += weight;

    let rand = Math.random() * weightSum;
    for (const [key, weight] of map) {
        if (rand <= weight) return key;
        rand -= weight;
    }
    console.log('error picking weighted random option');
    return null; // should never happen lmao but you know OrangeCode™
}

exports.scrambleWord = (word) => {
    let output = "";
    let amount = 13;
    for (var i = 0; i < word.length; i++) {
        let c = word[i];
        if (c.match(/[a-z]/i)) {
            var code = word.charCodeAt(i);
            // uppercase letters
            if (code >= 65 && code <= 90) {
                c = String.fromCharCode(((code - 65 + amount) % 26) + 65);
            }

            // lowercase letters
            else if (code >= 97 && code <= 122) {
                c = String.fromCharCode(((code - 97 + amount) % 26) + 97);
            }
        }
        output += c;
    }
    return output;
}

// returns false if failed
exports.addBoost = (client, user, boostName) => {
    // clear expired boosts
    clearFinishedBoosts(client, user);
    // check if user has boost
    for (const boost of user.boosts)
        if (boost.name == boostName) return false;
    // add boost to array
    const boostData = { name : boostName, used : new Date() }
    user.boosts.push(boostData);
    return true;
}

var clearFinishedBoosts = exports.clearFinishedBoosts = (client, user) => {
    let toRemove = [];
    for (let i = 0; i < user.boosts.length; i++){
        let boostData = client.boosts.get(user.boosts[i].name);
        if (!boostData) boostData = client.potions.get(user.boosts[i].name);
        if (!boostData) {console.log(`couldnt find ${boost.name} data`); continue;}
        if (Date.now() - user.boosts[i].used >= boostData.duration) toRemove.push(i);
    }
    for (const index of toRemove) user.boosts.splice(index, 1);
}

var addThingToUser = exports.addThingToUser = (thingArray, thingName, count) => {
    // check if user has thing
    let thingIndex = -1;
    for (let i = 0; i < thingArray.length; i++){
        if (thingArray[i].name == thingName){
            thingIndex = i;
            break;
        }
    }
    // add thing to array
    if (thingIndex == -1) {
        const thingData = { name : thingName, count : count }
        thingArray.push(thingData);
    }
    // add 1 to thing count
    else thingArray[thingIndex].count += count; 
}

var addThingToUser = exports.addThingToUser = (thingArray, thingName, count) => {
    // check if user has thing
    let thingIndex = -1;
    for (let i = 0; i < thingArray.length; i++){
        if (thingArray[i].name == thingName){
            thingIndex = i;
            break;
        }
    }
    // add thing to array
    if (thingIndex == -1) {
        const thingData = { name : thingName, count : count }
        thingArray.push(thingData);
    }
    // add 1 to thing count
    else thingArray[thingIndex].count += count; 
}

var removeThingFromUser = exports.removeThingFromUser = (thingArray, thingName, count) => {
    // check if user has thing
    let thingIndex = -1;
    for (let i = 0; i < thingArray.length; i++){
        if (thingArray[i].name == thingName){
            thingIndex = i;
            break;
        }
    }
    if (thingIndex == -1) return console.log(`error removing ${thingName} from user: no item exists`)
    if (thingArray[thingIndex].count > count) thingArray[thingIndex].count -= count;
    else thingArray.splice(thingIndex, 1);
}

var sendAlert = exports.sendAlert = async (client, alertContent, guildID) => {
    let guildSettings = await guildSettingsModel.findOne({guildID: guildID})
    if (guildSettings) {
        if (guildSettings.settings.botChannel != -1) {
            let botC
            try {
                botC = await client.channels.fetch(guildSettings.settings.botChannel.toString());
            }
            catch (err) {console.error("error finding channel",err);}
            if (botC) botC.send(alertContent)
            else console.log("cant find channel");
        }
    }    
}
var saveUser = exports.saveUser = (user) => {
    creatureUserModel.replaceOne({userID: user.userID, guildID: user.guildID}, user)
}

// https://gist.github.com/endel/dfe6bb2fbe679781948c
exports.getMoonPhase = (year, month, day) => { 
    phases = ['new-moon', 'waxing-crescent-moon', 'quarter-moon', 'waxing-gibbous-moon', 'full-moon', 'waning-gibbous-moon', 'last-quarter-moon', 'waning-crescent-moon']
    let c = e = jd = b = 0;

    if (month < 3) {
      year--;
      month += 12;
    }

    ++month;
    c = 365.25 * year;
    e = 30.6 * month;
    jd = c + e + day - 694039.09; // jd is total days elapsed
    jd /= 29.5305882; // divide by the moon cycle
    b = parseInt(jd); // int(jd) -> b, take integer part of jd
    jd -= b; // subtract integer part to leave fractional part of original jd
    b = Math.round(jd * 8); // scale fraction from 0-8 and round

    if (b >= 8) b = 0; // 0 and 8 are the same so turn 8 into 0
    return {phase: b, name: phases[b]};
}
exports.fixFPErrors = (val) => {
    return parseFloat(val.toFixed(4));
}
Math.clamp = function(num, min, max) { return Math.min(Math.max(num, min), max); }

//  modified to allow larger influencesversion of : https://stackoverflow.com/questions/29325069/how-to-generate-random-numbers-biased-towards-one-value-in-a-range
Math.biasedRand = function(min, max, bias, influence) {
    var rnd = Math.random() * (max - min) + min,                // random in range
        mix = Math.clamp(Math.random() * influence, 0, 1);      // random mixer
    return rnd * (1 - mix) + bias * mix;                        // mix full range and bias
}

String.prototype.equalsIgnoreCase = function(otherString) {
    return this.localeCompare(otherString, undefined, { sensitivity: 'accent' }) == 1; // == 1 because it returns a number, 1 will be true
}

String.prototype.toCaps = function() {
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return this.split(' ').map(capitalize).join(' ');
}

Date.parseWADate= function(date){
    let pieces = date.split("/");
    let toParse = date; 

    if (pieces[0].length <= 2) toParse = pieces[1] + "/" + pieces[0] + "/" + pieces[2]; // converts from the right way to the american way

    return new Date(Date.parse(toParse)).addHours(8);
}

Date.prototype.toCountdown = function(){
    const days = Math.floor(this.getTime() / (1000 * 60 * 60 * 24));
    const timeHMS = new Date(this.getTime()).toISOString().substr(11, 8);
    const hours = parseInt(timeHMS.substr(0, 2));
    const mins = parseInt(timeHMS.substr(3, 5));
    const secs = parseInt(timeHMS.substr(6, 8));

    let string = "";
    if(days != 0) string += `${days}d `
    if(hours != 0) string += `${hours}h `
    if(mins != 0) string += `${mins}m `
    if(secs != 0) string += `${secs}s `
    if (string == "") string = "0s"; // if the timer is 0;

    /*(days > 0 ? days + "d " : "") + 
            (hours > 0 || days > 0 ? hours + "h " : "") +
            (mins > 0 || hours > 0 || days > 0 ? mins + "m " : "") +
            secs + "s ";*/

    return string;
}

Date.prototype.toDMYHM= function(){
    return this.getDate() + "/" + this.getMonth() + "/" + this.getFullYear() + " " + this.getHours() + ":" + ('0'+this.getMinutes()).slice(-2);;
}

Date.prototype.toHM= function(){
    return this.getHours() + ":" + ('0'+this.getMinutes()).slice(-2);;
}

Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}

Map.prototype.sortMap = function() {
    // spread syntax (...) expands map into its values
    // sort returns an array with the key and value as index 0 and 1 respectively
    return new Map([...this.entries()].sort((a, b) => b[1] - a[1]));
}
Map.prototype.sortMapObject = function(byField) {
    return new Map([...this.entries()].sort((a, b) => b[1][byField] - a[1][byField]));
}

/*function getNameList(reaction, emoji){ 
    let list = '';
    console.log(emoji);
    reaction.message.reactions.cache.forEach(react => {   // for each reaction on the message which got the reaction
        react.users.fetch().then((usermap) => {                 // get the collection of users
            usermap.each(user => {                              // for each user in the collection
                console.log(react.emoji.name);
                if (!user.bot && react.emoji.name == emoji) list += user.username 
            });
        });
    }); 
    console.log("LIST: " + list);
    return new Promise(list);
}*/

// problem with returning before setting temp value. im dumb
/*
async function getTemp() {
    var temp = -999;
    const url = 'http://api.openweathermap.org/data/2.5/weather?q=Perth&appid=' + process.env['WEATHERTOKEN'];
    await request(url, function(err, response, body) {
        // On return, check the json data fetched
        if (err) {
            console.log(err)
        } else {
            let weather = JSON.parse(body);
            if (weather.main == undefined) console.log("error getting weather")
            else temp = weather.main.temp - 273.15;  
        }
    });
    return temp;
}*/

/*async function logCreatureGame (toLog) {
    var dt =  (new Date()).addHours(8);
    var dateString = dt.getDate() + "/" + dt.getMonth() + "/" + dt.getFullYear() + " " + dt.getHours() + ":" + ('0'+dt.getMinutes()).slice(-2); // minutes is just adding 0 to the end and cutting it off if its 3 digits
    let line = dateString + ": " + toLog + "\n";
    
    fs.appendFile('creatureLog.txt', line, function (err) {
        if (err) throw err;
    });
}*/

/*async function recordMessage (Discord, client, message) {
    var dt =  message.createdAt.addHours(8);
    var dateString = dt.getDate() + "/" + dt.getMonth() + "/" + dt.getFullYear() + " " + dt.getHours() + ":" + ('0'+dt.getMinutes()).slice(-2); // minutes is just adding 0 to the end and cutting it off if its 3 digits
    let line = dateString + " " + message.author.username + ": " + message.content + "\n";
    
    //create file if it doesnt exist

    var dir = 'msgLog/' + message.guild.name;
    var fileName = message.channel.name + '.txt'

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.appendFile(dir + '/' + fileName, line, function (err) {
        if (err) throw err;
    });
}*/