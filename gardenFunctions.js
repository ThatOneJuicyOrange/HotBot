const { MessageEmbed } = require('discord.js');
var fs = require('fs');
const creatureUserModel = require('./models/creatureUserSchema');
const guildSettingsModel = require('./models/guildSettingsSchema');
const config = require("./config.json");
const functions = require("./functions.js");


var updatePlantWater = exports.updatePlantWater = async (client, user, plant) => {
    let plantData = client.plants.get(plant.name);
    if (!plantData) return console.log(`error getting ${plant.name} data`);

    const userStats = await functions.getUserStats(client, user.userID, user.guildID);

    let waterRate = plantData.waterRate * (1 + (1 - userStats.gardenWaterNeed));

    //console.log(`updating ${user.userID}'s ${plant.name}`);

    if (Date.now() - plant.lastWatered.getTime() > waterRate) {
        let difference = 0;
        if (plant.lastWatered.getTime() >= plant.lastUnwateredUpdate.getTime())
            difference = plant.lastWatered.getTime() + waterRate;
        else 
            difference = plant.lastUnwateredUpdate.getTime();
        //creatureUserModel.update({}, {$inc: {timeUnwatered: Date.now() - difference}})
        plant.timeUnwatered += Date.now() - difference;
        plant.lastUnwateredUpdate = new Date();
    }
}

exports.fixDefaultGarden = (user) => {
    if (user.garden.plants.length == 0) {
        for(let i = 0; i < 8; i++) user.garden.plants.push({name: "none", planted: null, lastWatered: null, timeUnwatered: 0, lastUnwateredUpdate: new Date()});
    }
}