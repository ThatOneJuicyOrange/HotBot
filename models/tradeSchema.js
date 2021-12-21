const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}

const tradeSchema = new mongoose.Schema({
    messageID: reqString,
    status: {type: String, required: true, default: 'Open'} ,
    traders: [{ userID : String, accepted: Boolean, creatures: [{name: String, count: Number}] }],
})

module.exports = mongoose.model('tradeMsg', tradeSchema)