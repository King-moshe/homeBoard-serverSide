const express = require("express");
const { MissionModel } = require("../models/missionModel");
const router = express.Router();

router.get("/", async (req, res) => {
  res.json({ msg: "Missions Work 200" });
})

router.get('/missionsList', async (req, res) => {
  try {
    let data = await MissionModel
      .find({})
    res.json(data)
  } catch (error) {
    console.log(error);

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