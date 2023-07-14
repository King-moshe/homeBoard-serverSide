const express = require("express");
const { MissionModel, validateMissionPut } = require("../models/missionModel");
const { authAdmin, auth } = require("../middlewares/auth");
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

router.delete('/:id', async (req, res) => {
  try {
    let id = req.params.id;
    let data = await MissionModel.deleteOne({ _id: id });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(502).json({ error })
  }
})

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

router.put('/:id', async (req, res) => {
  try {
    const mission = await MissionModel.findById(req.params.id);
    if (!mission) {
      return res.status(404).send('Mission not found');
    }
    mission.execution_status = req.body.execution_status;
    await mission.save();
    res.send(mission);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});



module.exports = router;