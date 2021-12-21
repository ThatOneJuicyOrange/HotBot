module.exports = {
    name: "Ruby",
    desc: "Rubies are aggressive miners with a diet of fresh stone. They are quite territorial and will attack anyone that comes near them when mining. They go on day long food trips every second day and cannot be found during these trips. However, they rest for the weekends and can be found before going off on Monday again",
    requirements: "Monday, Wednesday, Friday, Saturday, Sunday",
    price: 0,
    hatchTime: 5 * 60 * 60 * 1000,
    rarity(user){ return 0.5 }, 
    available(user) {
        const time = new Date().addHours(8);
        return time.getDay() % 2 != 0 || time.getDay() >= 5;
    }
}