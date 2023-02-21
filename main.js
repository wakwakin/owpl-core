const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()

const MONGODB = 'mongodb+srv://owpl:owpl-admin@owpl.zbx8the.mongodb.net/core?retryWrites=true&w=majority'

// Controllers
const Authentication = require('./controllers/authentication')
const Member = require('./controllers/member')

app.set('view engine', 'ejs')
app.use(cors({
    origin: '*'
}))
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
    res.setHeader('Access-Control-Allow-Credentials', true)
    next()
})
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/api', Authentication)
app.use('/api', Member)

require('./services/import')

mongoose.set('strictQuery', false)
mongoose.connect(MONGODB).then(() => {
    app.listen(3000, () => {
        console.log('Connected')
    })
})