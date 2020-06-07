const express = require('express')
const router = express.Router()
const Category = require('../models/category')
const Post = require('../models/post')
const { body } = require('express-validator')

router.route('/')
.post([
    body('title').escape().trim().isLength({ min: 3 }),
    body('content').trim().isLength({ min: 10 }),
    body('summary').trim().isLength({ min: 10 }),
    body('category').trim().isLength({ min: 24, max: 24 }),
    body('active').toBoolean()
], async(req, res) => {
    try {
        const post = new Post({
            title: req.body.title,
            content: req.body.content,
            summary: req.body.summary,
            category: req.body.category,
            active: req.body.active
        })
        const newPost = await post.save()
        res.redirect(`/post/${newPost._id}`)
    } catch {
        res.redirect('/')
    }
})

router.route('/new')
.get(async(req, res) => {
    let page = {title: 'New Post'}
    try {
        const categories = await Category.find()
        res.render('post/new', {page, categories})
    } catch {
        res.redirect('/')
    }
})

router.route('/:id')
.get(async(req, res) => {
    let page = {title: 'show post ' + req.params.id}
    try {
        const post = await Post.findOneAndUpdate(req.params.id, {$inc: { views: 1 }})
        if(post.active) res.render('post/show', {page, post})
    } catch(err) {
        console.log(err)
        res.redirect('/')
    }
})

module.exports = router