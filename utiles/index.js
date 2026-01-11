const jwt = require("jsonwebtoken");
const config = require("config");
const multer = require("multer");

const auth = (req, res, next) => {
  // Get token from header
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(
      token,
      config.get("jwtSecret"),
      (err, decoded) => {
        if (err) {
          return res
            .status(401)
            .json({ msg: "Token is not valid, authorization denied" });
        } else {
          req.user = decoded.user;

          next();
        }
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}`);
  },
});
const upload = multer({ storage: storage }).single("file");
module.exports = { auth, upload };
