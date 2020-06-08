const express = require('express')
const router = express.Router()
const Category = require('../models/category')
const Post = require('../models/post')
const { check, validationResult } = require('express-validator')

router.route('/')
.post([
    check('title').escape().trim().isLength({ min: 3 }).withMessage('Must be at least 3 chars long'),
    check('content').trim().isLength({ min: 10 }).withMessage('Must be at least 10 chars long'),
    check('summary').trim().isLength({ min: 10 }).withMessage('Must be at least 10 chars long'),
    check('category').escape().trim().isLength({ min: 24, max: 24 }).withMessage('Must be an ID'),
    check('active').toBoolean()
], async(req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
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
    try {
        const categories = await Category.find()
        let page = {title: 'New Post'}
        let post = {}
        res.render('post/new', {page, categories, post})
    } catch {
        res.redirect('/')
    }
})

router.route('/:id')
.get(async(req, res) => {
    let page = {title: 'show post ' + req.params.id}
    try {
        const post = await Post.findOneAndUpdate({'_id': req.params.id, 'active': true}, {$inc: { views: 1 }}, {new: true}).populate('category')
        if(!post.active) return res.redirect('/')
        res.render('post/show', {page, post})
    } catch {
        res.redirect('/')
    }
})
.delete(async(req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        const category = post.category.id
        await post.remove()
        res.redirect(`/category/${category}`)
    } catch {
        res.redirect('/')
    }
})
.put([
    check('title').escape().trim().isLength({ min: 3 }).withMessage('Must be at least 3 chars long'),
    check('content').trim().isLength({ min: 10 }).withMessage('Must be at least 10 chars long'),
    check('summary').trim().isLength({ min: 10 }).withMessage('Must be at least 10 chars long'),
    check('category').escape().trim().isLength({ min: 24, max: 24 }).withMessage('Must be an ID'),
    check('active').toBoolean()
], async(req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    try {
        let post = await Post.findById(req.params.id)
        post.title = req.body.title
        post.content = req.body.content
        post.summary = req.body.summary
        post.category = req.body.category
        post.active = req.body.active

        await post.save()
        res.redirect(`/post/${post._id}`)
    } catch {
        res.redirect('/')
    }
})

router.route('/:id/edit')
.get(async(req, res) => {
    try {
        const categories = await Category.find()
        const post = await Post.findById(req.params.id).populate('category').exec()
        let page = {title: 'New Post'}
        res.render('post/edit', {page, categories, post})
    } catch {
        res.redirect('/')
    }
})

module.exports = router