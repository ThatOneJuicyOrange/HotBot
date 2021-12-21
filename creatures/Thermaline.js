const functions = require('../functions.js')
const weather = require("../weatherCache.json");

module.exports = {
    name: "Thermaline",
    desc: "",
    requirements: "Raining and above 15C",
    price: 0,
    hatchTime: 6 * 60 * 60 * 1000,
    rarity(user){ return 0.8 }, 
    available(user) {
        return (functions.isRaining(user)) && weather.temperature > 15;
        }
}