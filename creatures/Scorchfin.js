module.exports = {
    name: "Scorchfin",
    desc: "",
    requirements: "Weekend, under 30C",
    price: 0,
    hatchTime: 6 * 60 * 60 * 1000,
    rarity: (client, user) => 0.25 , 
    available: (client, user) => {
        const time = new Date().addHours(8);
        return (time.getDay() == 6 || time.getDay() == 0) && client.weatherCache.temperature < 30;    
    }
}