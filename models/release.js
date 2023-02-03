const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    memberId: { type: String },
    remainingBalance: { type: Number },
    releaseDate: { type: String },
    releaseAmount: { type: Number },
    releaseOutgoing: { type: Number },
    nextPaymentDate: { type: String },
    processingFee: { type: Number },
    miscellaneousFee: { type: Number },
    dailyPayment: { type: Number }
})

module.exports = mongoose.model('Release', schema)