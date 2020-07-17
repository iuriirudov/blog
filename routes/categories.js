const express = require('express')
const router = express.Router()
const Category = require('../models/category')
const Post = require('../models/post')
const { check, validationResult } = require('express-validator')
const middleware = require('../middleware/login')

router.route('/')
.post(middleware.redirectLogin, [
    check('name')
    .escape()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Must be at least 3 chars long')
], async(req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    try {
        const category = new Category({
            name: req.body.name
        })
        const newCategory = await category.save()
        res.redirect(`/category/${newCategory._id}`)
    } catch {
        res.redirect('/')
    }
})

router.route('/new')
.get(middleware.redirectLogin, async(req, res) => {
    const categories = await Category.find()
    let page = {title: 'Creating a new category'}
    let category = {}
    const user = res.locals.user
    res.render('category/new', {page, category, categories, user})
})

router.route('/:id')
.get(async(req, res) => {
    try {
        const categories = await Category.find()
        const category = await Category.findById(req.params.id)
        const posts = await Post.find({'category': category._id})
        let page = {title: category.name}
        const user = res.locals.user
        res.render('category/show', {category, page, posts, categories, user})
    } catch {
        res.redirect('/')
    }
})
.put(middleware.redirectLogin, [
    check('name')
    .escape()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Must be at least 3 chars long')
], async(req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    const formData = {'name': req.body.name}
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, formData)
        res.redirect(`/category/${category._id}`)
    } catch {
        res.redirect('/')
    }
})
.delete(middleware.redirectLogin, async(req, res) => {
    try {
        const category = await Category.findByIdAndRemove(req.params.id)
        category ? await Post.deleteMany({'category': category._id}) : res.redirect('/')
        res.redirect('/')
    } catch {
        res.redirect('/')
    }
})

router.route('/:id/edit')
.get(middleware.redirectLogin, async(req, res) => {
    try {
        const categories = await Category.find()
        const category = await Category.findById(req.params.id)
        let page = {title: 'Edit category: ' + category.name}
        const user = res.locals.user
        res.render('category/edit', {category, page, categories, user})
    } catch {
        res.redirect('/')
    }
})

module.exports = router