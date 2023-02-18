const file = require('./payments')

const Payment = require('../models/member-payment')
const Member = require('../models/member')
const Center = require('../models/center')

let centers = []
let members = []
let payments = []

file.map(async (data) => {
    if (centers.indexOf(data.centerName) === -1 && data.centerName) {
        centers.push(data.centerName)
    }

    if (members.map(m => m.memberName).indexOf(data.memberName) === -1 && data.memberName) {
        members.push({
            memberName: data.memberName,
            centerName: data.centerName,
            balance: data.balance
        })
    }

    payments.push({
        memberName: data.memberName,
        paymentDate: data.paymentDate,
        paymentAmount: data.paymentAmount,
        balance: data.balance
    })

    return
})

// console.log("Center count: " + centers.length)
// console.log("Member count: " + members.length)
// console.log("Payment count: " + payments.length)

// new Promise((resolve, reject) => {
//     centers.map((center) => {
//         Center.findOne({ centerName: center }).then((result) => {
//             if (!result) {
//                 new Center({
//                     centerName: center,
//                     centerleader: ''
//                 }).save().then((save) => {
//                     console.log(save)
//                 })
//             }
//         })
//     })

//     resolve(centers)
// })

// new Promise((resolve, reject) => {
//     members.map((member) => {
//         Member.findOne({ memberName: member.memberName }).then((result) => {
//             if (!result) {
//                 Center.findOne({ centerName: member.centerName }).then((center) => {
//                     if (center) {
//                         let centerId = center._id.toString()
    
//                         new Member({
//                             memberName: member.memberName,
//                             lastReleaseDate: '',
//                             lastReleaseAmount: 0,
//                             lastPaymentDate: '',
//                             lastPaymentAmount: 0,
//                             releaseDate: '',
//                             releaseAmount: 0,
//                             savings: 0,
//                             cycles: 0,
//                             centerId: centerId,
//                             centerName: member.centerName,
//                             balance: member.balance
//                         }).save().then((save) => {
//                             console.log(save)
//                         })
//                     } else {
//                         console.log('Center ' + member.centerName + ' not found!')
//                     }
//                 })
//             }
//         })
//     })

//     resolve(members)
// })

// new Promise((resolve, reject) => {
//     payments.map((payment) => {
//         Member.findOne({ memberName: payment.memberName }).then((member) => {
//             if (member) {
//                 console.log(member)
//                 let memberId = member._id.toString()
//                 new Payment({
//                     memberId,
//                     paymentDate: payment.paymentDate,
//                     paymentAmount: payment.paymentAmount,
//                     cycle: 0,
//                     balance: payment.balance
//                 }).save().then((save) => {
//                     console.log(save)
//                 })
//             }
//         })
//     })

//     resolve(payments)
// })

module.exports = {}