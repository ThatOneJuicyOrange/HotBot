const functions = require('../functions.js')
const weather = require("../weatherCache.json");

module.exports = {
    name: "Skylin",
    desc: "",
    requirements: "Raining and above 20km/h winds",
    price: 0,
    hatchTime: 12 * 60 * 60 * 1000,
    rarity(user){ return 0.6 }, 
    available(user) {
        return (functions.isRaining(user)) && weather.windspd * 3.6 > 20;
        }
}