const express = require('express')
const router = express.Router()
const Category = require('../models/category')
const Post = require('../models/post')
const { body } = require('express-validator')

router.route('/')
.post([
    body('name')
    .escape()
    .trim()
    .isLength({ min: 3 })
], async(req, res) => {
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
    res.render('category/new', {page})
})

router.route('/:id')
.get(async(req, res) => {
    let page = {title: 'show category ' + req.params.id}
    res.render('category/show', {page})
})

module.exports = router