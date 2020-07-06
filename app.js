if (process.env.NODE_ENV !== 'production') require('dotenv').config()

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const indexRoute = require('./routes/index')
const categoriesRoute = require('./routes/categories')
const postsRoute = require('./routes/posts')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layout')
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}))

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL + 'blog', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

app.use('/', indexRoute)
app.use('/category', categoriesRoute)
app.use('/post', postsRoute)

app.listen(process.env.PORT || 3000)