const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

const connectionURL = "mongodb://127.0.0.1:27017";
const databaseName = "task-manager";

MongoClient.connect(
  connectionURL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (error, client) => {
    if (error) {
      return console.log("Unable to connect to database!");
    }

    const db = client.db(databaseName);

    db.collection('tasks').findOne({
        _id: mongodb.ObjectID('5f8d3484cd2c0aa0abbaf191')
    }, (error, result) => {
        console.log(result);
    })

    db.collection('tasks').find({
        completed: true
    }).toArray((error, data) => console.log(data));

    // db.collection('users').insertOne({
    //     name: 'Prasad',
    //     age: 29
    // })

    db.collection('users').updateMany({
        name: 'Prasad'
    }, {
        $set: {
            name: 'New Prasad'
        }
    }).then(result => console.log(result))
    .catch(err => console.log(err))

    // db.collection("tasks").insertMany(
    //   [
    //     {
    //       description: "Clean the house",
    //       completed: true,
    //     },
    //     {
    //       name: "Buy grocery",
    //       completed: false,
    //     },
    //   ],
    //   (error, result) => {
    //     if (error) {
    //       return console.log("Error occured while inserting mul records");
    //     }

    //     console.log(result.ops);
    //   }
    // );
  }
);
