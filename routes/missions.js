const express = require("express");
const { MissionModel } = require("../models/missionModel");
const { authAdmin } = require("../middlewares/auth");
const router = express.Router();

router.get("/", async (req, res) => {
  res.json({ msg: "Missions Work 200" });
})

router.get("/missionsList", authAdmin, async (req, res) => {
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

module.exports = router;