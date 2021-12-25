const creatureUserModel = require('../../models/creatureUserSchema');
const { MessageEmbed } = require('discord.js');
const functions = require('../../functions.js')
const cf = require('../../creatureFunctions.js')

module.exports = {
    name: 'eggprob',
    description: 'see what eggs people can get',
    usage: "%PREFIX%eggprob <test probability Y/N>",
    admin: true,
    async execute(client, message, args, Discord){
        let user = await functions.getUser( message.author.id, message.guild.id);
        if (!user) return message.channel.send("can't find profile");

        const userStats = await functions.getUserStats(client, user.userID, user.guildID);

        if ( args[0] != "Y"){
            let eggs = ""
            let total = 0;
            for (const [name, creature] of client.creatures) {
                total += cf.calculateWeight(client,user,creature,userStats);
            }
            for (const [name, creature] of client.creatures) {
                if (cf.calculateWeight(client,user,creature,userStats) != 0) eggs += creature.name + "  |  " + ((cf.calculateWeight(client,user,creature,userStats) / total) * 100).toFixed(2) + "\n";
            }
            message.channel.send(eggs);
        }
        else {
            const probabilityMap = new Map();
        
            let total = 0;
            // total weight for expected rarity
            for (const [name, creature] of client.creatures) {
                total += cf.calculateWeight(client,user,creature,userStats);
            }

            availableEggs = [];
        
            for (const [name, creature] of client.creatures) {
                if (cf.calculateWeight(client,user,creature,userStats) != 0) { 
                    availableEggs.push(creature);
                    probabilityMap.set(creature.name, {count: 0});
                }
            }

            if (availableEggs.length == 0) { console.log("no eggs available"); return; }

            let weightSum = 0.0;
            for (const egg of availableEggs) weightSum += cf.calculateWeight(client,user,egg,userStats);
            let trials = 20000;
            for (let i = 0; i < trials; i++) {
                let rand = Math.random() * weightSum;
                for (const egg of availableEggs) {
                    if (rand <= cf.calculateWeight(client,user,creature,userStats)) {
                        probabilityMap.get(egg.name).count++;
                        break;
                    }
                    rand -= cf.calculateWeight(client,user,creature,userStats); 
                }
            }
            let eggs = "";
            for (const [name, value] of probabilityMap) {
                let calculated = ((cf.calculateWeight(client,user,client.creatures.get(name),userStats) / total) * 100).toFixed(2);
                 eggs += name + "  |  " + 
                 ((value.count / trials) * 100).toFixed(2) + "  |  " +  
                 calculated + "\n";
            }
            message.channel.send(eggs);
        }
    }
}   