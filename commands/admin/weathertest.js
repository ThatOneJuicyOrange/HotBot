const functions = require('../../functions.js')

module.exports = {
    name: 'weathertest',
    description: 'weatherTest',
    usage: "%PREFIX%weatherTest",
    admin: true,
    async execute(client, message, args, Discord){  
        let weather = await functions.getWeather();
        console.log(weather);
    }
}   