const weather = require("../weatherCache.json");

module.exports = {
    name: "Smold",
    desc: "",
    requirements: "Above 25km/h winds",
    price: 0,
    hatchTime: 12 * 60 * 60 * 1000,
    rarity(user){ return 0.4 }, 
    available(user) {
        return weather.windspd * 3.6 > 25;
        }
}