const Privilege = require('../models/privilege_model')

const PrivilegeController = {
    createPrivilege: async (req, res) => {
        const privilege = new Privilege({
            ...req.body,
        })

        try {
            await privilege.save()
            res.status(201).send(privilege)
        } catch (error) {
            res.status(400).send(error)
        }
    },

    getAllPrivileges: async (req, res) => {
        try {
            const privileges = await Privilege.find({})

            res.send(privileges)
        } catch (error) {
            res.status(400).send(error)
        }
    },

    getPrivilege: async (req, res) => {
        const _id = req.params.id

        try {
            const privilege = await Privilege.findOne({
                _id,
            })

            if (!privilege) return res.status(404).send()

            res.send(privilege)
        } catch (error) {
            res.status(500).send()
        }
    },

    updatePrivilege: async (req, res) => {
        const updates = Object.keys(req.body)

        try {
            const privilege = await Privilege.findOne({
                _id: req.params.id,
            })

            if (!privilege) return res.status(404).send()

            updates.forEach((update) => (privilege[update] = req.body[update]))

            await privilege.save()

            res.send(privilege)
        } catch (error) {
            res.status(400).send(error)
        }
    },

    deletePrivilege: async (req, res) => {
        try {
            const privilege = await Privilege.findOneAndDelete({
                _id: req.params.id,
            })

            if (!privilege) return res.status(404).send()

            res.send(privilege)
        } catch (error) {
            res.status(500).send(error)
        }
    },
}

module.exports = PrivilegeController
