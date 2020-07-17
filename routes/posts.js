const express = require('express')
const router = express.Router()
const Category = require('../models/category')
const Post = require('../models/post')
const { check, validationResult } = require('express-validator')
const middleware = require('../middleware/login')

router.route('/')
.post(middleware.redirectLogin, [
    check('title').escape().trim().isLength({ min: 3 }).withMessage('Must be at least 3 chars long'),
    check('content').trim().isLength({ min: 10 }).withMessage('Must be at least 10 chars long'),
    check('summary').trim().isLength({ min: 10 }).withMessage('Must be at least 10 chars long'),
    check('category').escape().trim().isLength({ min: 24, max: 24 }).withMessage('Must be an ID'),
], async(req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    try {
        if(!req.body.headImage) req.body.headImage = undefined
        const post = new Post({
            title: req.body.title,
            headImage: req.body.headImage,
            content: req.body.content,
            summary: req.body.summary,
            category: req.body.category,
            tags: req.body.tags.split(',').map(item=>item.trim())
        })
        const newPost = await post.save()
        res.redirect(`/post/${newPost._id}`)
    } catch {
        res.redirect('/')
    }
})
.get([check('search').escape().trim(), check('tag').escape().trim()], async(req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    const user = res.locals.user
    if(req.query.search) {
        try {
            const regex = {$regex: new RegExp(req.query.search, 'i')}
            const categories = await Category.find()
            const posts = await Post.find({
                $or: [
                    {title: regex},
                    {content: regex},
                    {summary: regex}
                ]
            }).populate('category')
            const category = {}
            const page = {title: `Search for: ${req.query.search}`}
            res.render('post/searchResults', {posts, categories, category, page, searchString: req.query.search, user})
        } catch {
            res.redirect('/')
        }
    } else if(req.query.tag) {
        try {
            const request = req.query.tag
            const regex = {$regex: new RegExp(request, 'i')}
            const categories = await Category.find()
            const posts = await Post.find({tags: regex}).populate('category')
            const category = {}
            const page = {title: `Selected tag for: ${request}`}
            res.render('post/searchResults', {posts, categories, category, page, searchString: request, user})
        } catch {
            res.redirect('/')
        }
    } else {
        return res.redirect('/')
    }
})

router.route('/new')
.get(middleware.redirectLogin, async(req, res) => {
    try {
        const categories = await Category.find()
        let page = {title: 'New Post'}
        const post = {}
        const category = {}
        const user = res.locals.user
        res.render('post/new', {page, categories, post, category, user})
    } catch {
        res.redirect('/')
    }
})

router.route('/:id')
.get(async(req, res) => {
    const user = res.locals.user
    try {
        const categories = await Category.find()
        const post = await Post.findOneAndUpdate({'_id': req.params.id}, {$inc: { views: 1 }}, {new: true}).populate('category')
        const category = post.category
        let page = {title: post.title}
        res.render('post/show', {page, post, categories, category, user})
    } catch {
        res.redirect('/')
    }
})
.delete(middleware.redirectLogin, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        const category = post.category._id
        await post.remove()
        res.redirect(`/category/${category}`)
    } catch {
        res.redirect('/')
    }
})
.put(middleware.redirectLogin, [
    check('title').escape().trim().isLength({ min: 3 }).withMessage('Must be at least 3 chars long'),
    check('content').unescape().trim().isLength({ min: 10 }).withMessage('Must be at least 10 chars long'),
    check('summary').trim().isLength({ min: 10 }).withMessage('Must be at least 10 chars long'),
    check('category').escape().trim().isLength({ min: 24, max: 24 }).withMessage('Must be an ID'),
], async(req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    try {
        if(!req.body.headImage) req.body.headImage = undefined
        let post = await Post.findById(req.params.id)
        post.title = req.body.title
        post.headImage = req.body.headImage
        post.content = req.body.content
        post.summary = req.body.summary
        post.category = req.body.category
        post.tags = req.body.tags.split(',').map(item=>item.trim())
        await post.save()
        res.redirect(`/post/${post._id}`)
    } catch {
        res.redirect('/')
    }
})

router.route('/:id/edit')
.get(middleware.redirectLogin, async(req, res) => {
    try {
        const categories = await Category.find()
        const post = await Post.findById(req.params.id).populate('category').exec()
        let page = {title: 'Edit Post: ' + post.title}
        const category = {}
        const user = res.locals.user
        res.render('post/edit', {page, categories, post, category, user})
    } catch {
        res.redirect('/')
    }
})

module.exports = router