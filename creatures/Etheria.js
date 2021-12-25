module.exports = {
    name: "Etheria",
    desc: "A mystical creature that is almost never sighted, let alone kept. It is theorised that they can phase through walls, hence their supernatural ability to evade capture. The only way to get one of these creatures is for it to imprint on you as a baby, but even then, finding one of their eggs can be near impossible.",
    requirements: "Between 6pm and 6am",
    price: 0,
    hatchTime: 3 * 24 * 60 * 60 * 1000,
    rarity: (client, user) => 0.05, 
    available: (client, user) => new Date().addHours(18,6)
}