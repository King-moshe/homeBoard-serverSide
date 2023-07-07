const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { config } = require("../config/secrets");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  p_name: String,
  city_name: String,
  street_name: String,
  building_name: String,
  story: Number,
  apartment: Number,
  files: Array,
  comments: Array,
  missions: Array,
  date_created: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    default: "User",
    enum: ['Admin', 'Contractor', 'User']
  },
});

exports.UserModel = mongoose.model("users", userSchema);

//function create token 
exports.createToken = (user_id, role) => {
  let token = jwt.sign({ _id: user_id, role: role }, config.token_secret, { expiresIn: "600mins" })
  return token;
}

// עושה בדיקה בצד שרת אם המידע תקין
// לפני ששולח לצד של המסד
exports.validateUser = (_reqBody) => {
  let joiSchema = Joi.object({
    name: Joi.string().min(2).max(150).required(),
    email: Joi.string().min(2).max(150).email().required(),
    password: Joi.string().min(4).max(150).required(),
    phone: Joi.string().min(6).max(30).required(),
    p_name: Joi.string().min(2).max(50).required(),
    city_name: Joi.string().min(2).max(50).required(),
    street_name: Joi.string().min(2).max(50).required(),
    building_name: Joi.string().min(1).max(40).allow('', null),
    story: Joi.number().max(50).required(),
    apartment: Joi.number().max(300).required(),
    files: Joi.array().max(11100).allow(null, ""),
    comments: Joi.array().max(11100).allow(null, ""),
    missions: Joi.array().max(150).allow(null, ""),
  });
  return joiSchema.validate(_reqBody);
};

exports.validateUserPut = (_reqBody) => {
  let joiSchema = Joi.object({
    name: Joi.string().min(2).max(150).allow(null, ""),
    email: Joi.string().min(2).max(150).email().allow(null, ""),
    phone: Joi.string().min(6).max(30).allow(null, ""),
    p_name: Joi.string().min(2).max(50).allow(null, ""),
    city_name: Joi.string().min(2).max(50).allow(null, ""),
    street_name: Joi.string().min(2).max(50).allow(null, ""),
    building_name: Joi.string().min(1).max(40).allow('', null),
    story: Joi.number().max(50).allow(null, ""),
    apartment: Joi.number().max(300).allow(null, ""),
    files: Joi.array().max(11100).allow(null, ""),
    comments: Joi.array().max(11100).allow(null, ""),
  });
  return joiSchema.validate(_reqBody);
};

exports.validateUserPost = (_reqBody) => {
  let joiSchema = Joi.object({
    name: Joi.string().min(2).max(150).allow(null, ""),
    email: Joi.string().min(2).max(150).email().allow(null, ""),
    phone: Joi.string().min(6).max(30).allow(null, ""),
    p_name: Joi.string().min(2).max(50).allow(null, ""),
    city_name: Joi.string().min(2).max(50).allow(null, ""),
    street_name: Joi.string().min(2).max(50).allow(null, ""),
    building_name: Joi.string().min(1).max(40).allow('', null),
    story: Joi.number().max(50).allow(null, ""),
    apartment: Joi.number().max(300).allow(null, ""),
    files: Joi.array().max(11100).allow(null, ""),
    comments: Joi.array().max(11100).allow(null, ""),
  });
  return joiSchema.validate(_reqBody);
};


exports.validateLogin = (_reqBody) => {
  let joiSchema = Joi.object({
    email: Joi.string().min(2).max(150).email().required(),
    password: Joi.string().min(3).max(150).required()
  })
  return joiSchema.validate(_reqBody);
}