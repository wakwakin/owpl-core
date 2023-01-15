const express = require('express')
const mongoose = require('mongoose')
const app = express()

const MONGODB = 'mongodb+srv://owpl:owpl-admin@owpl.zbx8the.mongodb.net/core?retryWrites=true&w=majority'

// Controllers
const Authentication = require('./controllers/authentication')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(Authentication)

mongoose.set('strictQuery', false)
mongoose.connect(MONGODB).then(() => {
    app.listen(3333, () => {
        console.log('Connected')
    })
})