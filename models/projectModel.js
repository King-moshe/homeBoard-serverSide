const mongoose = require("mongoose");
const Joi = require("joi");

let ProjectSchema = new mongoose.Schema({
  city_name: String,
  street_name: String,
  p_name: String,
  building_name:String,
  contractor_name: String,
  date_created: {
    type: Date, default: Date.now
  }
})

exports.ProjectModel = mongoose.model("projects", ProjectSchema);

exports.createId = (project_id) => {
  let _id = project_id;
  return _id;
}

exports.validateProject = (_reqBody) => {
  let joiSchema = Joi.object({
    city_name: Joi.string().min(2).max(20).required(),
    street_name: Joi.string().min(2).max(20).required(),
    p_name: Joi.string().min(2).max(40).required(),
    building_name: Joi.string().min(1).max(40).required(),
    contractor_name: Joi.string().min(1).max(50).required()
  })
  return joiSchema.validate(_reqBody)
}


