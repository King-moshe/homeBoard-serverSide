const express = require("express");
const { auth } = require("../middlewares/auth");
const path = require("path")
const router = express.Router();

router.get("/", async (req, res) => {
  res.json({ msg: "files work" });
})

router.get("/allFiles", auth, async (req, res) => {

  let perPage = Math.min(req.query.perPage, 20) || 5;
  let page = req.query.page - 1 || 0;
  let sort = req.query.sort || "_id"
  let reverse = req.query.reverse == "yes" ? 1 : -1
  try {
    let data = await FileModel
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



router.post("/upload", async (req, res) => {
  try {
    console.log(req.files.myFile);
    let myFile = req.files.myFile;
    //check the size
    if (myFile.size >= 1024 * 1024 * 5) {
      return res.status(400).json({ err: "file too big, Limit to 5MB" });
    }
    //check the extName
    let exts_arr = [".png", ".jpg", ".jpeg", ".pptm", ".pptx", ".docx", ".pdf"];
    if (!exts_arr.includes(path.extname(myFile.name.toLowerCase()))) {
      return res.status(400).json({ err: "File Not Allowed, just " + exts_arr.toString() });
    }
    // CLOUDINARY_URL=cloudinary://952563955782842:gEro9FyPOsNPp1KcJ5yKpXD-m4E@dnwud1i7t
    myFile.mv("public/files/" + myFile.name, (err) => {
      if (err) {
        return res.status(400).json({ err });
      }
      res.json({ msg: "file uploaded" });
    })
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
})


router.delete("/:id", auth, async (req, res) => {
  try {
    let id = req.params.id;

    let data;
    if (req.params.role == "admin") {
      data = await FileModel.deleteOne({ _id: id }, req.body);
    }
    else {
      data = await FileModel.deleteOne({ _id: id, user_id: req.params._id }, req.body.data);
    }
    res.json(data)
  }

  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})


// https://res.cloudinary.com/<cloud_name>/image/upload/h_150,w_100/olympic_flag

module.exports = router;