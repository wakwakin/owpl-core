const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String, unique: true },
    password: { type: String },
    roleId: { type: String },
    roleName: { type: String },
    rolePermission: [{}]
})

module.exports = mongoose.model('Employee', schema)