const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    employeeId: { type: String },
    employeeName: { type: String },
    actionValue: { type: String },
    actionType: { type: String },
    actionDate: { type: String },
    actionTime: { type: String },
    timestamp: { type: String }
})

module.exports = mongoose.model('Log', schema)