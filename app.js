if (process.env.NODE_ENV !== 'production') require('dotenv').config()

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const session = require('express-session')
const GenericMiddleware = require('./middleware')
const { v4: uuidv4 } = require('uuid')

const {
    SESSION_NAME = uuidv4(),
    SESSION_LIFETIME = 1000*60*20,
    SESSION_SECRET = 'secret string'
} = process.env

const indexRoute = require('./routes/index')
const categoriesRoute = require('./routes/categories')
const postsRoute = require('./routes/posts')
const userRoute = require('./routes/user')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layout')
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use('/static', express.static(path.join(__dirname, '/public')))
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}))

app.use(session({
    name: SESSION_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESSION_SECRET,
    cookie: {
        maxAge: SESSION_LIFETIME,
        sameSite: true,
        secure: false
    }
}))
app.use(GenericMiddleware)

mongoose.connect(process.env.DATABASE_URL + 'blog', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

app.use('/', indexRoute)
app.use('/category', categoriesRoute)
app.use('/post', postsRoute)
app.use('/user', userRoute)

app.listen(process.env.PORT || 3000)