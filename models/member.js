const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    memberName: { type: String },
})

module.exports = mongoose.model('Member', schema)