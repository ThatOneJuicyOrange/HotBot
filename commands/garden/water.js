const creatureUserModel = require('../../models/creatureUserSchema');
const config = require("../../config.json");
const gardenFunctions = require('../../gardenFunctions.js')
const functions = require('../../functions.js')

module.exports = {
    name: 'water',
    description: 'water a plant',
    usage: `!water <plot>`,
    async execute(client, message, args, Discord){
        let user = await functions.getUser( message.author.id, message.guild.id);
        if (!user) return message.channel.send("can't find profile");
 
        gardenFunctions.fixDefaultGarden(user);

        const userStats = await functions.getUserStats(client, message.author.id, message.guild.id);

        let plot = parseInt(args[0]);
        if (isNaN(plot)) return message.channel.send("huh thats not a number");
        else if (plot <= 0) return message.channel.send(`what.`)
        else if (plot > userStats.gardenPlots) return message.channel.send(`you dont have ${plot} plots`)
        plot -= 1;
        let plant = user.garden.plants[plot];
        if (plant.name == "none") return message.channel.send(`plot ${plot + 1} is empty`)

        await gardenFunctions.updatePlantWater(client, user, plant);

        plant.lastWatered = new Date();

        user.save();    

        message.channel.send(`successfully watered ${plant.name} in plot ${plot + 1}`)
    }
}   