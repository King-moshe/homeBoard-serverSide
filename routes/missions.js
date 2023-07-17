const express = require("express");
const { MissionModel, validateMission, validateEditMission } = require("../models/missionModel");
const { authAdmin } = require("../middlewares/auth");
const router = express.Router();

router.get("/", async (req, res) => {
  res.json({ msg: "Missions Work 200" });
})

router.get("/missionsList", async (req, res) => {
  let perPage = Math.min(req.query.perPage, 20) || 15;
  let page = req.query.page - 1 || 0;
  let sort = req.query.sort || "_id"
  let reverse = req.query.reverse == "yes" ? 1 : -1
  try {
    let data = await MissionModel
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


router.post('/', async (req, res) => {
  try {
    let mission = new MissionModel(req.body)
    await mission.save()
    res.status(201).json(mission)
  } catch (error) {
    console.log(error);

  }
})

router.put("/:id", async (req, res) => {
  let validBody = validateEditMission(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let id = req.params.id;
    let data = await MissionModel.updateOne({ _id: id }, req.body);
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.get("/singleMission/:id", async (req, res) => {
  try {
    let data = await MissionModel.findOne({ _id: req.params.id });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.delete("/:id", authAdmin, async (req, res) => {
  try {
    let id = req.params.id;
    let data = await MissionModel.deleteOne({ _id: id });
    res.json(data)
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to delete mission" });
  }
});

router.get('/userMissions/:user_id', async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const missions = await MissionModel.find({ user_id });
    res.json(missions);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get("/count", authAdmin, async (req, res) => {
  let perPage = Math.min(req.query.perPage, 20) || 5;
  try {
    let data = await MissionModel.countDocuments(perPage);
    res.json({ count: data, pages: Math.ceil(data / perPage) })
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
}) 

module.exports = router;
 