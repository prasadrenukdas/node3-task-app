const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/tasks", auth, (req, res) => {
  console.log(req.body);

  const task = new Task({ ...req.body, owner: req.user.id });

  task
    .save()
    .then(() => res.send(task))
    .catch((err) => {
      res.status(400);
      res.send(err);
    });
});

// /tasks?completed=true
// /tasks?sortBy=createdAt:desc
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const options = req.query.sortBy.split(":");
    console.log(options)
    sort[options[0]] = options[1] === "desc" ? -1 : 1;
  }

  try {
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send(err);
  }
});

router.get("/tasks/:id", auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      return res.status(400).send();
    }

    res.send(task);
  } catch (e) {
    res.status(500).send(err);
  }
});

router.patch("/tasks/:id", async (req, res) => {
  const _id = req.params.id;

  const requestTasks = Object.keys(req.body);

  const allowedUpdates = ["description", "completed"];

  const isAllowedTasks = requestTasks.every((task) =>
    allowedUpdates.includes(task)
  );

  if (!isAllowedTasks) {
    return res.status(400).send("Invalid request");
  }

  try {
    const task = await Task.findById(_id);

    if (task) {
      requestTasks.forEach((t) => {
        task[t] = req.body[t];
      });

      task.save();
      return res.send(task);
    }
    res.status(400).send("Failed to update");
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
