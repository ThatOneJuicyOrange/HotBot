const weather = require("../weatherCache.json");

module.exports = {
    name: "Pebleer",
    desc: "",
    requirements: "First week of the month, alternating weeks after that.",
    price: 0,
    hatchTime: 4 * 60 * 60 * 1000,
    rarity(user){ return 0.3 }, 
    available(user) {
        const time = new Date().addHours(8);
        return Math.floor(time.getDate() / 7) % 2 == 0
        }
}