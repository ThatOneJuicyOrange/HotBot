module.exports = {
    name: "Obpod",
    desc: "",
    requirements: "5pm-9pm. All day on Sundays",
    price: 0,
    hatchTime: 6 * 60 * 60 * 1000,
    weight: (client, user) => (new Date().addHours(8).betweenHours(17, 21) || new Date().addHours(8).getDay() == 0) ? 0.4 : 0
}