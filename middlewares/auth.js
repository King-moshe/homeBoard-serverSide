const jwt = require("jsonwebtoken");
const { config } = require("../config/secrets")

exports.auth = (req, res, next) => {
  let token = req.header("x-api-key");
  if (!token) {
    return res.status(401).json({ msg: "You must send token in the header to this endpoint" })
  }
  try {
    // בודק אם הטוקן תקין או בתקוף
    let decodeToken = jwt.verify(token, config.token_secret);
    // req -> יהיה זהה בכל הפונקציות שמורשרות באותו ראוטר
    req.tokenData = decodeToken;
    // לעבור לפונקציה הבאה בשרשור
    next();
  }
  catch (err) {
    return res.status(401).json({ msg: "Token invalid or expired" })
  }
}

// auth for admin only
exports.authAdmin = (req, res, next) => {
  let token = req.header("x-api-key");
  if (!token) {
    return res.status(401).json({ msg: "You must send token in the header to this endpoint" })
  }
  try {
    // בודק אם הטוקן תקין או בתקוף
    let decodeToken = jwt.verify(token, config.token_secret);
    // בודק אם הטוקן שייך לאדמין
    if (decodeToken.role != "Admin") {
      return res.status(401).json({ msg: "Just admin can be in this endpoint" })
    }
    // req -> יהיה זהה בכל הפונקציות שמורשרות באותו ראוטר
    req.tokenData = decodeToken;
    // לעבור לפונקציה הבאה בשרשור
    next();
  }
  catch (err) {
    return res.status(401).json({ msg: "Token invalid or expired" })
  }
}