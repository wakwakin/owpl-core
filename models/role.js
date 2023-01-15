const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    roleName: { type: String },
    rolePermission: { type: String }
})

module.exports = mongoose.model('Role', schema)