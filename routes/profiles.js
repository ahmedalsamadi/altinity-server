const express = require("express");
const { auth, upload } = require("../utiles");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const normalize = require("normalize-url").default;
const Profile = require("../models/Profile.js");
const User = require("../models/User.js");
const Post = require("../models/Post.js");

// ------------------- CREATE OR UPDATE PROFILE -------------------
router.post(
  "/",
  auth,
  check("status", "Status is required").notEmpty(),
  check("skills", "Skills is required").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { website, skills, youtube, facebook, twitter, instagram, linkedin, github, ...rest } = req.body;

    const profileFields = {
      user: req.user.id,
      website: website ? normalize(website, { forceHttps: true }) : "",
      skills: Array.isArray(skills) ? skills : skills.split(",").map(s => s.trim()),
      ...rest,
    };

    const socialFields = { youtube, facebook, twitter, instagram, linkedin, github };
    for (let key in socialFields) {
      if (socialFields[key]) socialFields[key] = normalize(socialFields[key], { forceHttps: true });
    }
    profileFields.social = socialFields;

    try {
      const profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true, upsert: true }
      );
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// ------------------- GET MY PROFILE -------------------
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate("user", ["name"]);
    if (!profile) return res.status(400).json({ msg: "There is no profile for this user" });
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ------------------- GET ALL PROFILES -------------------
router.get("/", auth, async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ------------------- GET PROFILE BY USER ID -------------------
router.get("/user/:user_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate("user", ["name"]);
    if (!profile) return res.status(400).json({ msg: "No profile for this user" });
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ------------------- DELETE USER, PROFILE & POSTS -------------------
router.delete("/", auth, async (req, res) => {
  try {
    await Promise.all([
      Post.deleteMany({ user: req.user.id }),
      Profile.findOneAndDelete({ user: req.user.id }),
      User.findOneAndDelete({ _id: req.user.id }),
    ]);
    res.json({ msg: "User and profile deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ------------------- UPLOAD PROFILE IMAGE -------------------
router.post("/upload", auth, async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) return res.status(500).send(`Server Error: ${err}`);
      if (!req.file) return res.status(400).send("No file uploaded");

      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) return res.status(404).json({ msg: "Profile not found" });

      profile.profilePic = req.file.path; // save file path
      await profile.save();
      res.json(profile);
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ------------------- EXPERIENCE -------------------
router.put(
  "/experience",
  auth,
  check("title", "Title is required").notEmpty(),
  check("company", "Company is required").notEmpty(),
  check("from", "From date is required").notEmpty().custom((value, { req }) => {
    if (req.body.to && new Date(value) > new Date(req.body.to)) {
      throw new Error("'From' date must be before 'to' date");
    }
    return true;
  }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(req.body);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.experience = profile.experience.filter(exp => exp._id.toString() !== req.params.exp_id);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ------------------- EDUCATION -------------------
router.put(
  "/education",
  auth,
  check("school", "School is required").notEmpty(),
  check("degree", "Degree is required").notEmpty(),
  check("fieldofstudy", "Field of study is required").notEmpty(),
  check("from", "From date is required").notEmpty().custom((value, { req }) => {
    if (req.body.to && new Date(value) > new Date(req.body.to)) {
      throw new Error("'From' date must be before 'to' date");
    }
    return true;
  }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(req.body);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.education = profile.education.filter(edu => edu._id.toString() !== req.params.edu_id);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
