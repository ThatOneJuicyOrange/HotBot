module.exports = {
    name: "Magmalean",
    desc: "",
    requirements: "Above 30C",
    price: 0,
    hatchTime: 8 * 60 * 60 * 1000,
    rarity: (client, user) => 0.4, 
    available: (client, user) =>  client.weatherCache.temperature > 30
}