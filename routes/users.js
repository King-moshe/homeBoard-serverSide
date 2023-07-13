const express = require("express");
const bcrypt = require("bcrypt");
const { auth, authAdmin } = require("../middlewares/auth")
const { UserModel, validateUser, validateLogin, createToken, validateUserPut, validateUserPatch, validateUserPost } = require("../models/userModel")

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

router.get("/usersList", async (req, res) => {
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

router.get("/singleProject/:projectName/:buildingName", authAdmin, async (req, res) => {
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


// sign up
router.post("/", authAdmin, async (req, res) => {
  // Middleware function authAdmin is executed before the main handler function
  let validBody = validateUser(req.body);
  if (validBody.error) {
    // If validation fails, return a 400 Bad Request response with the validation error details
    return res.status(400).json(validBody.error.details);
  }
  try {
    // Create a new UserModel instance with the request body
    let user = new UserModel(req.body);
    // Hash the user's password using bcrypt with a salt factor of 10
    user.password = await bcrypt.hash(user.password, 10);
    // Save the user to the database
    await user.save();
    // Hide the user's password before sending the response
    user.password = "***";
    // Return the user object in the response
    res.json(user);
  }
  catch (err) {
    if (err.code == 11000) {
      return res.status(400).json({ msg: "Email already in system", code: 11000 });
    }
    console.log(err);
    res.status(502).json({ err });
  }
})

router.patch("/changePassword/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const { currentPassword, newPassword } = req.body;

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ msg: "Incorrect current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ msg: "Password changed successfully" });
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

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
    // res.json({token:token})
    res.json({ token, role: user.role, name: user.name })
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

/*PUT request */
router.put("/:id", auth, async (req, res) => {
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

router.put('/:userId/comments', async (req, res) => {
  const { error } = validateUserPut(req.body); // Validate the request body
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  try {
    const { userId } = req.params;
    const { text } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Add the new comment to the user's comments array
    user.comments.push({ text });

    await user.save(); // Save the updated user

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});


router.patch("/comments/:id/", async (req, res) => {
  try {
    // Extract the "id" parameter from the request URL
    const id = req.params.id;
    // Get the new comment from the request body
    const newComment = req.body;
    // Find the user by id and update the "comments" array with the new comment using $push
    const data = await UserModel.findOneAndUpdate(
      { _id: id },
      { $push: { comments: newComment } },
      { new: true }
    );

    // Return the updated user data in the response
    res.json(data);
  } catch (err) {
    console.log(err);
    // If an error occurs, log it to the console and return a 502 Bad Gateway response with the error object
    res.status(502).json({ err });
  }
});



router.post("/:id", auth, async (req, res) => {
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

/* PATCH request */
router.patch("/changeRole/:id/:role", authAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const newRole = req.params.role;
    const data = await UserModel.updateOne({ _id: id }, { role: newRole });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});


router.delete("/:id", authAdmin, async (req, res) => {
  try {
    let id = req.params.id;

    let data = await UserModel.deleteOne({ _id: id });

    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});



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



module.exports = router;
