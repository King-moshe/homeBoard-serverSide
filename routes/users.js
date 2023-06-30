const express = require("express");
const bcrypt = require("bcrypt");
const { auth, authAdmin } = require("../middlewares/auth")
const { UserModel, validateUser, validateLogin, createToken, validateUserPut } = require("../models/userModel")

const router = express.Router();


/* All the GET requests*/

router.get("/", async (req, res) => {
  res.json({ msg: "Users endpoint" });
})

router.get("/checkToken", auth, async (req, res) => {
  try {
    res.json(req.tokenData)
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.get("/usersList", authAdmin, async (req, res) => {
  let perPage = Math.min(req.query.perPage, 20) || 20;
  let page = req.query.page - 1 || 0;
  let sort = req.query.sort || "_id"
  let reverse = req.query.reverse == "yes" ? 1 : -1
  try {
    let data = await UserModel
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


router.get("/userInfo", auth, async (req, res) => {
  try {
    let user = await UserModel.findOne({ _id: req.tokenData._id }, { password: 0 });
    res.json(user);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.get("/userFiles/:id", auth, async (req, res) => {
  try {
    let user = await UserModel.findOne({ _id: req.params.id }, { password: 0 });
    res.json(user.files);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

// router.get("/userMissions/:id", async (req, res) => {
//   try {
//     let user = await UserModel.findOne({ _id: req.params.id }, { password: 0 });
//     res.json(user.missions);
//   }
//   catch (err) {
//     console.log(err);
//     res.status(502).json({ err })
//   }
// })


router.get("/singleProject/:projectName/:buildingName", async (req, res) => {
  const pName = req.params.projectName;
  const BuildingName = req.params.buildingName;

  try {
    let user = await UserModel.find({ $and: [{ p_name: pName }, { building_name: BuildingName }] }, { password: 0 });
    console.log(user);
    res.json(user);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})


router.get("/count", authAdmin, async (req, res) => {
  let perPage = Math.min(req.query.perPage, 20) || 5;
  try {
    let data = await UserModel.countDocuments(perPage);
    res.json({ count: data, pages: Math.ceil(data / perPage) })
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.post("/", authAdmin, async (req, res) => {
  let validBody = validateUser(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let user = new UserModel(req.body);

    user.password = await bcrypt.hash(user.password, 10);
    await user.save();

    user.password = "*****"
    res.json(user);
  }
  catch (err) {
    if (err.code == 11000) {
      return res.status(400).json({ msg: "Email already in system", code: 11000 })
    }
    console.log(err);
    res.status(502).json({ err })
  }
})

router.post("/logIn", async (req, res) => {
  let validBody = validateLogin(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let user = await UserModel.findOne({ email: req.body.email })
    if (!user) {
      return res.status(401).json({ msg: "Email or Password Worng." })
    }

    let validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(401).json({ msg: "Email or Password Worng." })
    }
    let token = createToken(user._id, user.role, user.name)
    res.json({ token, role: user.role, name: user.name })
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.patch("/changeRole/:id/:role", authAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const newRole = req.params.role;
    if (id == req.tokenData._id || id == "64519b451e47aad4b5739e93") {
      return res.status(401).json({ err: "You cant change your user role" })
    }
    const data = await UserModel.updateOne({ _id: id }, { role: newRole })
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.put("/:id", async (req, res) => {
  let validBody = validateUserPut(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const id = req.params.id
    const data = await UserModel.updateOne({ _id: id }, req.body)
    res.json(data)
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.post("/:id", async (req, res) => {
  let validBody = validateUserPost(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const id = req.params.id
    const data = await UserModel.updateOne({ _id: id }, req.body)
    res.json(data)
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.delete("/:id", authAdmin, async (req, res) => {
  try {
    let id = req.params.id;
    let data = await UserModel.deleteOne({ _id: id });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.delete('/removeFile/:userId/:fileUrl', async (req, res) => {
  const { userId, fileUrl } = req.params;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.sendStatus(404);
    }
    user.files = user.files.filter((url) => url !== fileUrl);
    await user.save();
    res.sendStatus(200);
  } catch (error) {
    console.log('Error removing file:', error);
    res.sendStatus(500);
  }
});

router.post('/:userId/comments', async (req, res) => {
  try {
    const userId = req.params.userId;
    const comment = req.body.comment;
    const writeComment = req.tokenData._id
    // Find the user by userId
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Push the new comment to the comments array
    user.comments.push(comment, writeComment);
    // Save the updated user
    await user.save();
    res.status(200).json({ message: 'Comment added successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:userId/comments', async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find the user by userId
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const comments = user.comments;
    res.status(200).json({ comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;