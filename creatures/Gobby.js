module.exports = {
    name: "Gobby",
    desc: "Gobbies are small humanoid beings rarely seen alone. They are incredibly social and enjoy competing with each other in little games. Presented with a staircase, they will attempt to race each other up the stairs with the last one.",
    requirements: "None.",
    price: 0,
    hatchTime: 8 * 60 * 60 * 1000,
    rarity(user) {
        const time = new Date().addHours(8);
        ///if (time.getDate() == 7 && time.getMonth() == 4) return 1;
        return 0.2;
    }, 
    available(user) { return true; }
}
// stop simping, bitch
/* Gobbies have a festival once a year on April 7th, in which they come to the land in abundance and celebrate by playing large football games with bleaps. */
