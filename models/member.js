const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    memberName: { type: String, unique: true },
    lastReleaseDate: { type: String },
    lastReleaseAmount: { type: Number },
    lastPaymentDate: { type: String },
    lastPaymentAmount: { type: String },
    releaseDate: { type: String },
    releaseAmount: { type: Number },
    cycles: { type: Number },
})

module.exports = mongoose.model('Member', schema)