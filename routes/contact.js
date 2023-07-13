const express = require("express");
const { validateContact, ContactModel } = require("../models/contactModel");

const router = express.Router();



router.get("/contactList", async (req, res) => {
    try {
        let count = await ContactModel.countDocuments({}); // Get the count of documents
        let perPage = Math.min(req.query.perPage, 20) || 15;
        let page = req.query.page - 1 || 0;
        let sort = req.query.sort || "_id";
        let reverse = req.query.reverse == "yes" ? 1 : -1;

        let data = await ContactModel
            .find({})
            .limit(perPage)
            .skip(page * perPage)
            .sort({ [sort]: reverse });

        res.json({ count, data });
    } catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});


// API endpoint for submitting the contact form
router.post('/', async (req, res) => {

    let validBody = validateContact(req.body);

    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        let contact = new ContactModel(req.body);
        await contact.save();
        res.json(contact);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
});


module.exports = router;
