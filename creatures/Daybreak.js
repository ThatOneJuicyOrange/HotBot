module.exports = {
    name: "Daybreak",
    desc: "",
    requirements: "Between 4am and 7am",
    price: 0,
    hatchTime: 12 * 60 * 60 * 1000,
    rarity(user){ return 0.15}, 
    available(user) {
        const time = new Date().addHours(8);
        return time.getHours() >= 4 && time.getHours() < 7;
    }
}