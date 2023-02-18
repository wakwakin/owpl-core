const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    memberFirstName: { type: String },
    memberLastName: { type: String },
    date: { type: String },
    timestamp: { type: String },
    timeIn: { type: String },
    timeOut: { type: String }
})

module.exports = mongoose.model('DTR', schema)