const express = require('express')
const Router = express.Router()

const vars = require('../const')
// Models
const Member = require('../models/member')
const Payment = require('../models/member-payment')
const Saving = require('../models/saving')
const Release = require('../models/release')
const Center = require('../models/center')

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
    let loanBalance = (parseFloat(req.body.releaseAmount) * .2) + (parseFloat(req.body.releaseAmount)) + (parseFloat(req.body.processingFee ? req.body.processingFee : 0))
    let data = {
        memberName: req.body.memberName,
        lastReleaseDate: req.body.lastReleaseDate,
        lastReleaseAmount: req.body.lastReleaseAmount,
        lastPaymentDate: req.body.lastPaymentDate,
        lastPaymentAmount: req.body.lastPaymentAmount,
        releaseDate: req.body.releaseDate,
        releaseAmount: req.body.releaseAmount,
        savings: req.body.savings,
        cycles: req.body.cycles,
        centerId: req.body.centerId,
        centerName: req.body.centerName,
        balance: loanBalance,
    }
    if (req.body.sameBalanceToggle) {
        data = {
            memberName: req.body.memberName,
            lastReleaseDate: req.body.lastReleaseDate,
            lastReleaseAmount: req.body.lastReleaseAmount,
            lastPaymentDate: req.body.lastPaymentDate,
            lastPaymentAmount: req.body.lastPaymentAmount,
            releaseDate: req.body.releaseDate,
            releaseAmount: req.body.releaseAmount,
            savings: req.body.savings,
            cycles: req.body.cycles,
            centerId: req.body.centerId,
            centerName: req.body.centerName,
        }
    }
    Member.findOneAndUpdate({
        _id: req.body.memberId
    }, data).then((result) => {
        if (result) {
            return res.status(200).send({
                data,
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
    let loanBalance = (parseFloat(req.body.releaseAmount) * .2) + (parseFloat(req.body.releaseAmount)) + (parseFloat(req.body.processingFee ? req.body.processingFee : 0))
    const data = {
        memberName: req.body.memberName,
        lastReleaseDate: req.body.lastReleaseDate,
        lastReleaseAmount: req.body.lastReleaseAmount,
        lastPaymentDate: req.body.lastPaymentDate,
        lastPaymentAmount: req.body.lastPaymentAmount,
        releaseDate: req.body.releaseDate,
        releaseAmount: req.body.releaseAmount,
        savings: req.body.savings,
        cycles: req.body.cycles,
        centerId: req.body.centerId,
        centerName: req.body.centerName,
        balance: loanBalance
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
    let data = req.query.id ? { memberId: req.query.id } : {}
    Payment.find(data)
    .limit(vars.DATA_LIMIT)
    .skip(page * vars.DATA_LIMIT)
    .then(async (result) => {
        if (result) {
            return res.send({
                data: result,
                total: await Payment.find(data).countDocuments(),
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
        paymentAmount: req.body.paymentAmount,
        cycle: req.body.cycle,
        balance: req.body.remainingBalance,
    }).then((result) => {
        if (result) {
            return res.status(200).send({
                data: {
                    paymentId: req.body.paymentId,
                    paymentDate: req.body.paymentDate,
                    paymentAmount: req.body.paymentAmount,
                    cycle: req.body.cycle,
                    balance: req.body.remainingBalance,
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
            paymentAmount: req.body.paymentAmount,
            cycle: req.body.cycle,
            balance: req.body.remainingBalance,
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

Router.get('/saving', (req, res) => {
    let page = req.query.page >= 1 ? parseInt(req.query.page) - 1 : 0
    Saving.find({ memberId: req.query.id })
    .limit(vars.DATA_LIMIT)
    .skip(page * vars.DATA_LIMIT)
    .then(async (result) => {
        if (result) {
            return res.send({
                data: result,
                total: await Saving.find({ memberId: req.query.id }).countDocuments(),
                success: true,
                message: 'Fetched member savings'
            })
        }

        return res.send({
            data: {},
            success: false,
            message: 'Member id does not exist'
        })
    })
})

Router.post('/saving', (req, res) => {
    Saving.findOneAndUpdate({
        _id: req.body.savingId
    }, {
        paymentDate: req.body.paymentDate,
        paymentAmount: req.body.paymentAmount
    }).then((result) => {
        if (result) {
            return res.status(200).send({
                data: {
                    savingId: req.body.savingId,
                    paymentDate: req.body.paymentDate,
                    paymentAmount: req.body.paymentAmount
                },
                success: true,
                message: 'Successfully updated savings'
            })
        }

        return res.status(400).send({
            data: {},
            success: false,
            message: 'Savings id does not exist'
        })
    })
})

Router.put('/saving', (req, res) => {
    Member.findById({ _id: req.body.memberId }).then(async (result) => {
        const data = {
            memberId: req.body.memberId,
            paymentDate: req.body.paymentDate,
            paymentAmount: req.body.paymentAmount
        }
    
        const saving = new Saving(data)
    
        await saving.save().then(() => {
            return res.status(200).send({
                data: {
                    id: saving._id.toString()
                },
                success: true,
                message: 'Created a new savings'
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

Router.delete('/saving', (req, res) => {
    Saving.findOneAndDelete({ _id: req.body.savingId }).then((result) => {
        if (result) {
            return res.status(200).send({
                data: {
                    savingId: req.body.savingId
                },
                success: true,
                message: 'Deleted a savings'
            })
        }

        return res.status(400).send({
            data: {},
            success: false,
            message: 'Savings does not exist'
        })
    })
})

Router.get('/release', (req, res) => {
    let page = req.query.page >= 1 ? parseInt(req.query.page) - 1 : 0
    Release.find()
    .limit(vars.DATA_LIMIT)
    .skip(page * vars.DATA_LIMIT)
    .then(async (result) => {
        if (result) {
            return res.send({
                data: result,
                total: await Release.find().countDocuments(),
                success: true,
                message: 'Fetched releases'
            })
        }

        return res.send({
            data: {},
            success: false,
            message: 'No releases'
        })
    })
})

Router.post('/release', (req, res) => {
    Release.findOneAndUpdate({
        _id: req.body.releaseId
    }, {
        nextPaymentDate: req.body.nextPaymentDate,
        dailyPayment: req.body.dailyPayment
    }).then((result) => {
        if (result) {
            return res.status(200).send({
                data: {
                    releaseId: req.body.releaseId,
                    nextPaymentDate: req.body.nextPaymentDate,
                    dailyPayment: req.body.dailyPayment
                },
                success: true,
                message: 'Successfully updated release'
            })
        }

        return res.status(400).send({
            data: {},
            success: false,
            message: 'Release id does not exist'
        })
    })
})

Router.put('/release', (req, res) => {
    Member.findById({ _id: req.body.memberId }).then(async (result) => {
        const data = {
            memberId: req.body.memberId,
            remainingBalance: req.body.remainingBalance,
            releaseDate: req.body.releaseDate,
            releaseAmount: req.body.releaseAmount,
            releaseOutgoing: req.body.releaseOutgoing,
            nextPaymentDate: req.body.nextPaymentDate,
            dailyPayment: req.body.dailyPayment
        }
    
        const release = new Release(data)
    
        await release.save().then(() => {
            return res.status(200).send({
                data: {
                    id: release._id.toString()
                },
                success: true,
                message: 'Created a new release'
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

Router.delete('/release', (req, res) => {
    Release.findOneAndDelete({ _id: req.body.releaseId }).then((result) => {
        if (result) {
            return res.status(200).send({
                data: {
                    releaseId: req.body.releaseId
                },
                success: true,
                message: 'Deleted a release'
            })
        }

        return res.status(400).send({
            data: {},
            success: false,
            message: 'Release does not exist'
        })
    })
})

Router.get('/center/fix', (req, res) => {
    Member.find().then(async (result) => {
        if (!result) return res.send({ data: {}, success: false, message: 'No members' })
        
        result.map((member) => {
            let centerName = member.centerName
            let centerId = member.centerId
            let memberId = member._id.toString()
            Center.find({ _id: centerId }).then((center) => {
                let newCenterName = center[0].centerName
                if (newCenterName != centerName) {
                    Member.findOneAndUpdate({ _id: memberId }, { centerName: newCenterName}).then((result) => data.push(result))
                }
            })
        })

        return res.send({
            data: {},
            success: true,
            message: 'Fixed center names'
        })
    })
})

Router.get('/center', (req, res) => {
    let page = req.query.page >= 1 ? parseInt(req.query.page) - 1 : 0
    Center.find()
    .limit(vars.DATA_LIMIT)
    .skip(page * vars.DATA_LIMIT)
    .then(async (result) => {
        if (result) {
            return res.send({
                data: result,
                total: await Center.find().countDocuments(),
                success: true,
                message: 'Fetched centers'
            })
        }

        return res.send({
            data: {},
            success: false,
            message: 'No centers'
        })
    })
})

Router.post('/center', (req, res) => {
    Center.findOneAndUpdate({
        _id: req.body.centerId
    }, {
        centerName: req.body.centerName,
        centerLeader: req.body.centerLeader
    }).then((result) => {
        if (result) {
            return res.status(200).send({
                data: {
                    centerId: req.body.centerId,
                    centerName: req.body.centerName,
                    centerLeader: req.body.centerLeader
                },
                success: true,
                message: 'Successfully updated center'
            })
        }

        return res.status(400).send({
            data: {},
            success: false,
            message: 'Center id does not exist'
        })
    })
})

Router.put('/center', async (req, res) => {
    const data = {
        centerName: req.body.centerName,
        centerLeader: req.body.centerLeader
    }

    const center = new Center(data)

    await center.save().then(() => {
        return res.status(200).send({
            data: {
                id: center._id.toString()
            },
            success: true,
            message: 'Created a new center'
        })
    })
})

Router.delete('/center', (req, res) => {
    Center.findOneAndDelete({ _id: req.body.centerId }).then((result) => {
        if (result) {
            return res.status(200).send({
                data: {
                    centerId: req.body.centerId
                },
                success: true,
                message: 'Deleted a center'
            })
        }

        return res.status(400).send({
            data: {},
            success: false,
            message: 'Center does not exist'
        })
    })
})

Router.get('/balance', (req, res) => {
    Member.findOne({ _id: req.query.id }).then((member) => {
        return res.send({
            data: {
                balance: member.balance
            },
            success: true,
            message: 'Fetched member balance'
        })
    })
})

Router.put('/balance', (req, res) => {
    Member.findOneAndUpdate(
        {
            _id: req.body.memberId
        },
        {
            lastPaymentAmount:  parseFloat(req.body.paymentAmount),
            lastPaymentDate: req.body.paymentDate,
            balance: parseFloat(req.body.remainingBalance)
        }
    ).then((result) => {
        if (result) {
            return res.send({
                data: result,
                success: true,
                message: "Updated balance"
            })
        }

        return res.send({
            data: {},
            success: false,
            message: 'Something went wrong'
        })
    })
})

module.exports = Router