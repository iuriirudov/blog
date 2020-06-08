const express = require('express')
const router = express.Router()
const Category = require('../models/category')
const Post = require('../models/post')
const { check, validationResult } = require('express-validator')

router.route('/')
.post([
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
.get(async(req, res) => {
    let page = {title: 'New Category'}
    let category = {}
    res.render('category/new', {page, category})
})

router.route('/:id')
.get(async(req, res) => {
    try {
        const category = await Category.findById(req.params.id)
        const posts = await Post.find({'category': category._id})
        let page = {title: 'Show Category ' + category.name}
        res.render('category/show', {category, page, posts})
    } catch {
        res.redirect('/')
    }
})
.put([
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
.delete(async(req, res) => {
    try {
        const category = await Category.findByIdAndRemove(req.params.id)
        category ? await Post.deleteMany({'category': category._id}) : res.redirect('/')
        res.redirect('/')
    } catch {
        res.redirect('/')
    }
})

router.route('/:id/edit')
.get(async(req, res) => {
    try {
        const category = await Category.findById(req.params.id)
        let page = {title: 'Edit Category ' + category.name}
        res.render('category/edit', {category, page})
    } catch {
        res.redirect('/')
    }
})

module.exports = router