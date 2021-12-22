const mongoose = require('mongoose')

// so we dont have to type x: {type: string, etc}
const reqString = {
    type: String,
    required: true
}

const guildSettingsSchema = new mongoose.Schema({
    guildID: reqString,
    settings: {
        botChannel: { type: String, default: "" },
        prefix: { type: String, default: "!" }
        }
    })

module.exports = mongoose.model('GuildSettings', guildSettingsSchema)