const creatureUserModel = require('../../models/creatureUserSchema');
const functions = require('../../functions.js')
const gardenFunctions = require('../../gardenFunctions.js')

module.exports = {
    name: 'harvest',
    description: 'harvest a crop!',
    usage: "!harvest <plot}",
    async execute(client, message, args, Discord){
       let user = await functions.getUser( message.author.id, message.guild.id);
        if (!user) return message.channel.send("can't find profile");

        const userStats = await functions.getUserStats(client, message.author.id, message.guild.id);
        gardenFunctions.fixDefaultGarden(user);

        if (!args[0]) return message.channel.send("**correct usage: **\n" + this.usage);
        let plot = parseInt(args[0]);
        plot -= 1;
        if (plot < 0 || isNaN(plot)) return message.channel.send(`what.`)
        let plant = user.garden.plants[plot];
        if (plant.name == "none") return message.channel.send(`plot ${plot + 1} is empty :(`)

        let plantData = client.plants.get(plant.name);
        if (!plantData) return console.log("couldnt find " + plant.name);

        if ((Date.now() - plant.planted - plant.timeUnwatered) * userStats.gardenGrowthRate < plantData.growTime) {
            const filter = m => m.author.id == message.author.id;
            const collector = new Discord.MessageCollector(message.channel, filter, {
                max: 1,
                time: 15 * 1000, // 15s
            });
            message.channel.send(`your ${plant.name} in plot ${plot + 1} is not ready to be harvested, are you sure?`);
            
            const yessir = ["yes", "yeah", "ye", "yea", "y"];

            collector.on("collect", m => {
                if (yessir.includes(m.content.toLowerCase())) harvestPlant(message, user,plantData, plot, false);    
            });
        }
        else harvestPlant(message, user,plantData, plot, true)
    }
}   
function harvestPlant(message, user, plantData, plot, ready) {
    user.garden.plants[plot] = {name: "none", planted: null, lastWatered: null, timeUnwatered: 0, lastUnwateredUpdate: 0}
    if (ready) functions.addThingToUser(user.inventory.plants, plantData.name, plantData.plantYield)
    user.save();
    if (ready) message.channel.send(`succesfully harvested ${plantData.plantYield} ${plantData.name}`);
    else message.channel.send(`succesfully cut ${plantData.name}`);
}