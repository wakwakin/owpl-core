const express = require('express')
const Router = express.Router()

const vars = require('../const')
// Models
const Member = require('../models/member')
const Payment = require('../models/member-payment')

Router.get('/member', (req, res) => {
    let page = req.query.page >= 1 ? parseInt(req.query.page) - 1 : 0
    Member.find()
    .limit(vars.DATA_LIMIT)
    .skip(page * vars.DATA_LIMIT)
    .then(async (result) => {
        if (result) {
            return res.status(200).send({
                data: result,
                total: await Member.countDocuments(),
                success: true,
                message: 'Fetched members'
            })
        }

        return res.status(400).send({
            data: {},
            success: false,
            message: 'No member'
        })
    })
})

Router.post('/member', (req, res) => {
    Member.findOneAndUpdate({
        _id: req.body.memberId
    }, {
        memberName: req.body.memberName,
        lastReleaseDate: req.body.lastReleaseDate,
        lastReleaseAmount: req.body.lastReleaseAmount,
        lastPaymentDate: req.body.lastPaymentDate,
        lastPaymentAmount: req.body.lastPaymentAmount,
        releaseDate: req.body.releaseDate,
        releaseAmount: req.body.releaseAmount,
        cycles: req.body.cycles,
    }).then((result) => {
        if (result) {
            return res.status(200).send({
                data: {
                    memberId: req.body.memberId,
                    memberName: req.body.memberName,
                    lastReleaseDate: req.body.lastReleaseDate,
                    lastReleaseAmount: req.body.lastReleaseAmount,
                    lastPaymentDate: req.body.lastPaymentDate,
                    lastPaymentAmount: req.body.lastPaymentAmount,
                    releaseDate: req.body.releaseDate,
                    releaseAmount: req.body.releaseAmount,
                    cycles: req.body.cycles
                },
                success: true,
                message: 'Successfully updated member'
            })
        }

        return res.status(400).send({
            data: {},
            success: false,
            message: 'Member id does not exist'
        })
    })
})

Router.put('/member', async (req, res) => {
    const data = {
        memberName: req.body.memberName,
        lastReleaseDate: req.body.lastReleaseDate,
        lastReleaseAmount: req.body.lastReleaseAmount,
        lastPaymentDate: req.body.lastPaymentDate,
        lastPaymentAmount: req.body.lastPaymentAmount,
        releaseDate: req.body.releaseDate,
        releaseAmount: req.body.releaseAmount,
        cycles: req.body.cycles,
    }

    const member = new Member(data)

    await member.save().then(() => {
        res.status(200).send({
            data: {
                id: member._id.toString()
            },
            success: true,
            message: 'Created a new member'
        })
    }).catch(() => {
        return res.status(400).send({
            data: {},
            success: false,
            message: 'Member already exist'
        })
    })
})

Router.delete('/member', (req, res) => {
    Member.findOneAndDelete({ _id: req.body.memberId }).then((result) => {
        if (result) {
            return res.status(200).send({
                data: {
                    memberId: req.body.memberId
                },
                success: true,
                message: 'Deleted a member'
            })
        }

        return res.status(400).send({
            data: {},
            success: false,
            message: 'Member does not exist'
        })
    })
})

Router.get('/payment', (req, res) => {
    let page = req.query.page >= 1 ? parseInt(req.query.page) - 1 : 0
    Payment.find({ memberId: req.query.id })
    .limit(vars.DATA_LIMIT)
    .skip(page * vars.DATA_LIMIT)
    .then(async (result) => {
        if (result) {
            return res.send({
                data: result,
                total: await Payment.find({ memberId: req.query.id }).countDocuments(),
                success: true,
                message: 'Fetched member payments'
            })
        }

        return res.send({
            data: {},
            success: false,
            message: 'Member id does not exist'
        })
    })
})

Router.post('/payment', (req, res) => {
    Payment.findOneAndUpdate({
        _id: req.body.paymentId
    }, {
        paymentDate: req.body.paymentDate,
        paymentAmount: req.body.paymentAmount
    }).then((result) => {
        if (result) {
            return res.status(200).send({
                data: {
                    paymentId: req.body.paymentId,
                    paymentDate: req.body.paymentDate,
                    paymentAmount: req.body.paymentAmount
                },
                success: true,
                message: 'Successfully updated payment'
            })
        }

        return res.status(400).send({
            data: {},
            success: false,
            message: 'Payment id does not exist'
        })
    })
})

Router.put('/payment', (req, res) => {
    Member.findById({ _id: req.body.memberId }).then(async (result) => {
        const data = {
            memberId: req.body.memberId,
            paymentDate: req.body.paymentDate,
            paymentAmount: req.body.paymentAmount
        }
    
        const payment = new Payment(data)
    
        await payment.save().then(() => {
            return res.status(200).send({
                data: {
                    id: payment._id.toString()
                },
                success: true,
                message: 'Created a new payment'
            })
        })
    }).catch(() => {
        return res.status(400).send({
            data: {},
            success: false,
            message: 'Member does not exist'
        })
    })
})

Router.delete('/payment', (req, res) => {
    Payment.findOneAndDelete({ _id: req.body.paymentId }).then((result) => {
        if (result) {
            return res.status(200).send({
                data: {
                    paymentId: req.body.paymentId
                },
                success: true,
                message: 'Deleted a payment'
            })
        }

        return res.status(400).send({
            data: {},
            success: false,
            message: 'Payment does not exist'
        })
    })
})

module.exports = Router