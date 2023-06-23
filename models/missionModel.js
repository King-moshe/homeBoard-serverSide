const mongoose = require("mongoose");
const Joi = require("joi");


const missionSchema = new mongoose.Schema({
    title: String,
    info: String,
    user_name: String,
    execution_status: {
        type: String,
        default: 'waiting',
        enum: ['waiting', 'done']
    },
    importance: {
        type: String,
        default: "regular",
        enum: ["regular", "important"]
    },
    date_created: {
        type: Date,
        default: Date.now
    },
})

exports.MissionModel = mongoose.model('missions', missionSchema);

exports.validateMission = (_reqBody) => {
    let joiSchema = Joi.object({
        title: Joi.string().min(2).max(100).required(),
        info: Joi.string().min(2).max(1000).required(),
        user_name: Joi.string().min(2).max(50).required()

    })
    return joiSchema.validate(_reqBody)
}