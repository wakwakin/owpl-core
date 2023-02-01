const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Router = express.Router()

const vars = require('../const')
// Models
const Employee = require('../models/employee')
const Role = require('../models/role')

Router.post('/login', (req, res) => {
    Employee.findOne({ username: req.body.username }).then((result) => {
        if (result) {
            return bcrypt.compare(req.body.password, result.password).then((isPasswordMatch) => {
                if (isPasswordMatch) {
                    return Role.findOne({ _id: result.roleId}).then((role) => {
                        let newPermission = []
                        let permission = role.rolePermission.split(':')
                        permission.map((module) => {
                            let access = module.split('|')
                            newPermission.push({
                                moduleName: access[0],
                                modulePermission: access[1]
                            })
                        })

                        result.rolePermission = newPermission
                        result.password = ''
                        
                        let token = jwt.sign(JSON.stringify(result), 'THIS_IS_A_SECRET')

                        return res.send({
                            data: result,
                            token,
                            success: true,
                            message: 'Logged in'
                        })
                    })
                }

                return res.send({
                    data: {},
                    success: false,
                    message: 'Password is wrong'
                })
            })
            
        }

        return res.status(400).send({
            data: {},
            success: false,
            message: 'Username does not exist'
        })
    })
})

Router.post('/logout', (req, res) => {
    res.status(200).send({
        data: {},
        success: true,
        message: 'Logged out'
    })
})

Router.get('/employee', (req, res) => {
    let page = req.query._page >= 1 ? parseInt(req.query._page) - 1 : 0
    Employee.find()
    .limit(vars.DATA_LIMIT)
    .skip(page * vars.DATA_LIMIT)
    .then(async (result) => {
        if (result) {
            if (req.query._search) {
                let search = req.query._search
                result = result.filter(filter => {
                    if (filter.firstName.toLowerCase().includes(search.toLowerCase())) return filter
                    if (filter.lastName.toLowerCase().includes(search.toLowerCase())) return filter
                    if (filter.username.toLowerCase().includes(search.toLowerCase())) return filter
                    if (filter.roleName.toLowerCase().includes(search.toLowerCase())) return filter
                })
            }

            return res.status(200).send({
                data: result,
                total: await Employee.countDocuments(),
                success: true,
                message: 'Fetched employees'
            })
        }

        return res.status(400).send({
            data: {},
            success: false,
            message: 'No employee'
        })
    })
})

Router.post('/employee', (req, res) => {
    Role.findById(req.body.roleId).then((result) => {
        let newRole = result.roleName
        Employee.findOneAndUpdate({
            username: req.body.username
        }, {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            roleId: req.body.roleId,
            roleName: newRole
        }).then((result) => {
            if (result) {
                return res.status(200).send({
                    data: {
                        username: req.body.username,
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        roleName: newRole
                    },
                    success: true,
                    message: 'Successfully updated employee'
                })
            }

            return res.status(400).send({
                data: {},
                success: false,
                message: 'Username does not exist'
            })
        })
    }).catch((err) => {
        return res.status(400).send({
            data: {},
            success: false,
            message: 'Role does not exist'
        })
    })
})

Router.put('/employee', (req, res) => {
    bcrypt.hash(req.body.password, vars.SALT, async (err, hash) => {
        if (err) {
            return res.status(404).send({
                data: {},
                success: false,
                message: 'Password is blank'
            })
        }

        const data = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username,
            password: hash,
            roleId: req.body.roleId,
            roleName: req.body.roleName,
            rolePermission: ''
        }

        const employee = new Employee(data)
    
        await employee.save().then(() => {
            res.status(200).send({
                data: {
                    id: employee._id.toString()
                },
                success: true,
                message: 'Created a new employee'
            })
        }).catch(() => {
            return res.status(400).send({
                data: {},
                success: false,
                message: 'Username already exist'
            })
        })
    })
})

Router.delete('/employee', (req, res) => {
    Employee.findOneAndDelete({ username: req.body.username }).then((result) => {
        if (result) {
            return res.status(200).send({
                data: {
                    username: req.body.username
                },
                success: true,
                message: 'Deleted an employee'
            })
        }

        return res.status(400).send({
            data: {},
            success: false,
            message: 'Username does not exist'
        })
    })
})

Router.get('/role', (req, res) => {
    let limit = req.query._page >= 1 ? vars.DATA_LIMIT : 0
    let page = req.query._page >= 1 ? parseInt(req.query._page) - 1 : 0
    Role.find()
    .limit(limit)
    .skip(page * limit)
    .then(async (result) => {
        if (result) {
            let rolePermission = []
            result.map((role) => {
                let newPermission = []
                let permission = role.rolePermission.split(':')
                permission.map((module) => {
                    let access = module.split('|')
                    newPermission.push({
                        moduleName: access[0],
                        modulePermission: access[1]
                    })
                })
                rolePermission.push({
                    id: role._id.toString(),
                    roleName: role.roleName,
                    rolePermission: newPermission
                })
            })

            return res.status(200).send({
                data: rolePermission,
                total: await Role.countDocuments(),
                success: true,
                message: 'Fetched roles'
            })
        }

        return res.status(400).send({
            data: {},
            success: false,
            message: 'No roles'
        })
    })
})

Router.post('/role', (req, res) => {
    Role.findOneAndUpdate({
        _id: req.body.roleId
    }, {
        roleName: req.body.roleName,
        rolePermission: req.body.rolePermission
    }).then((result) => {
        if (result) {
            return res.status(200).send({
                data: {
                    roleName: req.body.roleName,
                    rolePermission: req.body.rolePermission
                },
                success: true,
                message: 'Successfully updated role'
            })
        }

        return res.status(400).send({
            data: {},
            success: false,
            message: 'Role does not exist'
        })
    })
})

Router.put('/role', async (req, res) => {
    const data = {
        roleName: req.body.roleName,
        rolePermission: req.body.rolePermission
    }

    const role = new Role(data)

    await role.save().then((asd) => {
        res.status(200).send({
            data: role._id.toString(),
            success: true,
            message: 'Created a new role'
        })
    }).catch(() => {
        res.status(400).send({
            data: {},
            success: false,
            message: 'Role already exist'
        })
    })
})

Router.delete('/role', (req, res) => {
    Role.findOneAndDelete({ _id: req.body.roleId }).then((result) => {
        if (result) {
            return res.status(200).send({
                data: {
                    roleId: req.body.roleId
                },
                success: true,
                message: 'Deleted a role'
            })
        }

        return res.status(400).send({
            data: {},
            success: false,
            message: 'Role does not exist'
        })
    })
})

module.exports = Router