var fs = require('fs');

module.exports = {
    name: 'time',
    description: 'check internal time',
    usage: "!time",
    admin: true,
    execute(client, message, args, Discord){
        const time = new Date().addHours(8);
        message.channel.send(
            "time: " + time.getHours() + ":" + time.getMinutes() + "\n" +
            "date: " + time.getDate() + "\n" +
            "day: " + time.getDay()
        )
    }
}   