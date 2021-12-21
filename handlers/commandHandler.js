const fs = require('fs');

module.exports = (client, Discord) =>{
    const commandDirs = fs.readdirSync('./commands/');
    for (const dirName of commandDirs) { 
        const commandFiles = fs.readdirSync('./commands/' + dirName + "/").filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require('../commands/' + dirName + "/" + `${file}`);

            command.type = dirName;

            if (command.name) client.commands.set(command.name, command);
            if (command.alt) client.commands.set(command.alt, command);
            else continue;
        }
    }
}