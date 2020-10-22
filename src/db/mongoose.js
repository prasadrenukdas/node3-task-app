const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
});

// const tasks = mongoose.model('tasks', schema)

// const newTask = new tasks({
//     description: "Buy new shoes",
//     completed: 123
// })

// newTask
//   .save()
//   .then(() => console.log("Task saved"))
//   .catch((err) => console.log(err));

// const User = mongoose.model('User', {
//     name: {
//         type: String
//     },
//     age: {
//         type: Number
//     }
// })

// const me = new User({
//     name: 123,
//     age: '27'
// })

// me.save().then(). catch(err => console.log(err))
