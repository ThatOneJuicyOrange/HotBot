const fs = require('fs');

// EXPERIMENTAL AF
module.exports = {
    name: 'reload',
    description: 'reload all commands',
    usage: "!reload",
    admin: true,
    async execute(client, message, args, Discord){
        const handlers = fs.readdirSync(`${global.appRoot}/handlers`).filter(file => file.endsWith('.js'));
        for (handler of handlers)
            if(handler != "eventHandler.js") 
                require(`${global.appRoot}/handlers/${handler}`)(client, Discord);

        message.channel.send("reloaded");
    }
}   