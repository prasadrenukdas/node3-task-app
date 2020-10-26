const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { request } = require("express");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decodedToken._id,
      "tokens.token": token,
    });

    if (!user) {
      return res.status(400).send();
    }

    request.token = token;
    request.user = user;

    next();
  } catch (err) {
    res.status(400).send("Invalid credentials");
  }
};

module.exports = auth;
