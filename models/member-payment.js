const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    memberId: { type: String },
    paymentDate: { type: String },
    paymentAmount: { type: Number },
    cycle: { type: Number },
    balance: { type: Number }
})

module.exports = mongoose.model('Payment', schema)