const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()

const MONGODB = 'mongodb+srv://owpl:owpl-admin@owpl.zbx8the.mongodb.net/core?retryWrites=true&w=majority'

// Controllers
const Authentication = require('./controllers/authentication')
const Member = require('./controllers/member')

app.use(cors({
    origin: '*'
}))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(Authentication)
app.use(Member)

require('./services/import')

mongoose.set('strictQuery', false)
mongoose.connect(MONGODB).then(() => {
    app.listen(3000, () => {
        console.log('Connected')
    })
})