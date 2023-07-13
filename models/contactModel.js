const mongoose = require("mongoose");
const Joi = require("joi");

const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    message: String,
    date_created: {
        type: Date,
        default: Date.now,
    },
});

const ContactModel = mongoose.model("contact", contactSchema);

function validateContact(_reqBody) {
    let joiSchema = Joi.object({
        name: Joi.string().min(2).max(100).required(),
        email: Joi.string().min(2).max(100).required(),
        phone: Joi.string().min(2).max(100).required(),
        message: Joi.string().min(2).max(100).required(),
    });
    return joiSchema.validate(_reqBody);
}

module.exports = {
    ContactModel,
    validateContact,
};
