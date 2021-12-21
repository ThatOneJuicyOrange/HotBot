const creatureUserModel = require('../../models/creatureUserSchema');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'eggprob',
    description: 'see what eggs people can get',
    usage: "!eggprob <test probability Y/N>",
    admin: true,
    async execute(client, message, args, Discord){
        let user = await functions.getUser( message.author.id, message.guild.id);
        if (!user) return message.channel.send("can't find profile");
        
        if ( args[0] != "Y"){
            let eggs = ""
            let total = 0;
            for (const [name, creature] of client.creatures) {
                if (creature.available(user)) total += creature.rarity(user);
            }
            for (const [name, creature] of client.creatures) {
                if (creature.available(user)) eggs += creature.name + "  |  " + ((creature.rarity(user) / total) * 100).toFixed(2) + "\n";
            }
            message.channel.send(eggs);
        }
        else {
            const probabilityMap = new Map();
        
            let total = 0;
            // total weight for expected rarity
            for (const [name, creature] of client.creatures) {
                if (creature.available(user)) total += creature.rarity(user);
            }

            availableEggs = [];
        
            for (const [name, creature] of client.creatures) {
                if (creature.available(user)) { 
                    availableEggs.push(creature);
                    probabilityMap.set(creature.name, {count: 0});
                }
            }

            if (availableEggs.length == 0) { console.log("no eggs available"); return; }

            let weightSum = 0.0;
            for (const egg of availableEggs) weightSum += egg.rarity(user);
            let trials = 20000;
            for (let i = 0; i < trials; i++) {
                let rand = Math.random() * weightSum;
                for (const egg of availableEggs) {
                    if (rand <= egg.rarity(user)) {
                        probabilityMap.get(egg.name).count++;
                        break;
                    }
                    rand -= egg.rarity(user); 
                }
            }
            let eggs = "";
            for (const [name, value] of probabilityMap) {
                 eggs += name + "  |  " + 
                 ((value.count / trials) * 100).toFixed(2) + "  |  " +  
                 ((client.creatures.get(name).rarity(user) / total) * 100).toFixed(2) + "\n";
            }
            message.channel.send(eggs);
        }
    }
}   