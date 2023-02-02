const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    memberId: { type: String },
    paymentDate: { type: String },
    paymentAmount: { type: Number },
    savings: { type: Number }
})

module.exports = mongoose.model('Saving', schema)