const express = require('express')
const router = express.Router()
const Category = require('../models/category')
const Post = require('../models/post')

router.get('/', async(req, res) => {
    let page = {title: 'Homepage'}
    try {
        const posts = await Post
        .find({'active': true})
        .sort({_id: -1})
        .limit(10)
        .populate('category')
        .exec()
        const categories = await Category.find()
        const category = {}
        res.render('index', {
            page,
            posts,
            categories,
            category
        })
    } catch {
        res.send('INTERNAL ERROR')
    }
})

module.exports = router