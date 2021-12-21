module.exports = {
    name: 'ping',
    description: 'ping the bot. may bite',
    usage: "!ping",
    hidden: true,
    execute(client, message, args, Discord){
        message.channel.send('heyya cutie :)');
        console.log("someone pinged me");
    }
}