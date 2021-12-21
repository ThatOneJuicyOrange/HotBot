const functions = require('../functions.js')

module.exports = {
    name: "Kroll",
    desc: "Kroll's are likely the most feared creature. Capable of ripping prey apart cell by cell just by looking at them. What is even more worrying is their abundance during new moons. Their green glow inspires fear amongst everyone. Except gobbies. Gobbies aren't affected by Kroll's stare. Maybe their anatomy prevents it, or maybe they are too cute that even the Kroll doesn't want to kill them. Lucky for the rest of us, they dont seem to be seen outside of new moons.", 
    requirements: "New moon",
    price: 0,
    hatchTime: 3* 24 * 60 * 60 * 1000,
    rarity(user){ return 0.9; }, 
    available(user) { 
            const time = new Date().addHours(8);
            return (time.getHours() >= 18 || time.getHours() <= 6) && functions.getMoonPhase(time.getFullYear(), time.getMonth(), time.getDate()).phase == 0; 
        }
}