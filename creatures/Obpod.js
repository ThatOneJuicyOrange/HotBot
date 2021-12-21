const weather = require("../weatherCache.json");

module.exports = {
    name: "Obpod",
    desc: "",
    requirements: "5pm-9pm. All day on Sundays",
    price: 0,
    hatchTime: 6 * 60 * 60 * 1000,
    rarity(user){ return 0.4 }, 
    available(user) {
        const time = new Date().addHours(8);
        return (time.getHours() >= 17 && time.getHours() < 21) || time.getDay() == 0;    
        }
}