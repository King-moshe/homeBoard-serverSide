const mongoose = require("mongoose");
const Joi = require("joi");

const missionSchema = new mongoose.Schema({
    title: String,
    info: String,
    user_name: String,
    user_id: String,
    date_line: String,
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
});

exports.MissionModel = mongoose.model('missions', missionSchema);

exports.validateMission = (_reqBody) => {
    const joiSchema = Joi.object({
        title: Joi.string().min(2).max(100).required(),
        info: Joi.string().min(2).max(1000).required(),
        user_name: Joi.string().min(2).max(50).required(),
        date_line: Joi.string().min(2).max(30).required(),
        execution_status: Joi.string().valid('waiting', 'done').required(),
        importance: Joi.string().valid('regular', 'important').required()
    });

    return joiSchema.validate(_reqBody);
};

exports.validateMissionPut = (_reqBody) => {
    const joiSchema = Joi.object({
        title: Joi.string().min(2).max(100).allow("", null),
        info: Joi.string().min(2).max(1000).allow("", null),
        user_name: Joi.string().min(2).max(50).allow("", null),
        date_line: Joi.string().min(2).max(30).allow("", null),
        execution_status: Joi.string().valid('waiting', 'done').allow("", null),
        importance: Joi.string().valid('regular', 'important').allow("", null)
    });

    return joiSchema.validate(_reqBody);
};
