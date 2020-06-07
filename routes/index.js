const express = require('express')
const router = express.Router()
const Category = require('../models/category')
const Post = require('../models/post')

router.get('/', async(req, res) => {
    let page = {title: 'Homepage'}
    try {
        const posts = await Post
        .find()
        .sort({_id: -1})
        .limit(10)
        .populate('category')
        .exec()
        res.render('index', {
            page,
            posts
        })
    } catch {
        res.send('INTERNAL ERROR')
    }
})

module.exports = router