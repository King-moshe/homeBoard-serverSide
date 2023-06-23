const express = require("express");
const { authAdmin, authConstructor, auth } = require("../middlewares/auth");
const { validateProject, ProjectModel } = require("../models/projectModel")

const router = express.Router();

router.get("/", async (req, res) => {
  res.json({ msg: "Project info work" });
})

//?Only admin can see all projects 
router.get("/projectsList", authAdmin, async (req, res) => {
  let perPage = Math.min(req.query.perPage, 20) || 15;
  let page = req.query.page - 1 || 0;
  let sort = req.query.sort || "_id"
  let reverse = req.query.reverse == "yes" ? 1 : -1
  try {
    let data = await ProjectModel
      .find({})
      .limit(perPage)
      .skip(page * perPage)
      .sort({ [sort]: reverse })
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

//?Costumer can see only his projects

// ?Construcror can see only his projects

//? Create a new projecrs, and only "admin" can add new.
router.post("/", authAdmin, async (req, res) => {
  let validBody = validateProject(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let project = new ProjectModel(req.body);
    await project.save();
    res.status(201).json(project);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.get("/single/:id", async (req, res) => {
  try {
    let data = await ProjectModel.findOne({ _id: req.params.id });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})


router.put("/:id", async (req, res) => {
  let validBody = validateProject(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let id = req.params.id;
    let data = await ProjectModel.updateOne({ _id: id }, req.body);
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})


//? Just admin can deleted the project
router.delete("/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let data = await ProjectModel.deleteOne({ _id: id });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.get("/count", async (req, res) => {
  let perPage = Math.min(req.query.perPage, 20) || 5;
  try {
    let data = await ProjectModel.countDocuments(perPage);
    res.json({ count: data, pages: Math.ceil(data / perPage) })
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

module.exports = router;