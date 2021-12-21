const weather = require("../weatherCache.json");

module.exports = {
    name: "Magmalean",
    desc: "",
    requirements: "Above 30C",
    price: 0,
    hatchTime: 8 * 60 * 60 * 1000,
    rarity(user){ return 0.4 }, 
    available(user) {
        return weather.temperature > 30;    
        }
}