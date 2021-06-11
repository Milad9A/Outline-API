const Category = require('../models/category_model')

const CategoryController = {
    createCategory: async (req, res) => {
        const category = new Category(req.body)

        try {
            await category.save()
            res.status(201).send({ category })
        } catch (error) {
            res.status(400), send(error)
        }
    },

    getAllCategories: async (req, res) => {
        try {
            const categories = await Category.find({})

            res.send(categories)
        } catch (error) {
            res.status(500).send()
        }
    },

    getCategory: async (req, res) => {
        const _id = req.params.id

        try {
            const category = await Category.findOne({ _id })

            if (!category) return res.status(404).send()
            res.send(category)
        } catch (error) {
            res.status(500).send()
        }
    },

    updateCategory: async (req, res) => {
        const updates = Object.keys(req.body)

        try {
            const category = await Category.findOne({
                _id: req.params.id,
            })

            if (!category) return res.status(404).send()

            updates.forEach((update) => (category[update] = req.body[update]))

            await category.save()

            res.send(category)
        } catch (error) {
            res.status(400).send(error)
        }
    },

    deleteCategory: async (req, res) => {
        try {
            const category = await Category.findOneAndDelete({
                _id: req.params.id,
            })

            if (!category) return res.status(404).send()

            res.send(category)
        } catch (error) {
            res.status(500).send(error)
        }
    },

    getCategoryCourses: async (req, res) => {
        try {
            const category = await Category.findOne({
                _id: req.params.id,
            })

            if (!category) return res.status(404).send()

            await category.populate('courses').execPopulate()

            res.send(category.courses)
        } catch (error) {
            res.status(500).send()
        }
    },
}

module.exports = CategoryController
