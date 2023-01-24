const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    centerName: { type: String },
    centerLeader: { type: String }
})

module.exports = mongoose.model('Center', schema)