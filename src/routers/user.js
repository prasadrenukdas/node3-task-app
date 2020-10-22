const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");

const router = express.Router();

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload jpg or jpeg or png file only"));
    }
    cb(undefined, true);
  },
});

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (err, req, res, next) => {
    res.status(400).send({
      Error: err.message,
    });
  }
);

router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.post("/users", async (req, res) => {
  console.log(req.body);

  const user = new User(req.body);

  try {
    await user.save();

    const token = user.generateToken();

    res.send({ user, token });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/users/login", async (req, res) => {
  console.log(req.body.email);

  try {
    const existingUser = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = existingUser.generateToken();

    res.send({ existingUser, token });
  } catch (err) {
    res.status(400).send({});
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send("Logged out successfully");
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];

    await req.user.save();
    res.send("Logged out successfully");
  } catch (err) {
    res.status(500).send({ Error: "Something went wrong" });
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send({
      Error: "Something went wrong",
    });
  }
});

router.get("/users/me", auth, (req, res) => {
  if (req.user) {
    return res.send(req.user);
  }

  res.status(401).send();
});

router.patch("/users/me", auth, async (req, res) => {
  const _id = req.user._id;

  const requestUpdates = Object.keys(req.body);

  const allowedUpdates = ["age", "name", "email", "password"];

  const isAllowedUpdates = requestUpdates.every((task) =>
    allowedUpdates.includes(task)
  );

  if (!isAllowedUpdates) {
    return res.status(400).send("Invalid request");
  }

  try {
    const { user } = req;

    requestUpdates.forEach((t) => {
      user[t] = req.body[t];
    });

    await user.save();

    if (user) {
      return res.send(user);
    }

    res.status(400).send("Failed to update");
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
