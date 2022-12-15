const mongoose = require("mongoose");

const password = process.argv[2];

const url = `mongodb+srv://nikolaipetukhov:${password}@cluster0.lbxz0cr.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (process.argv.length < 3) {
  console.log(
    "Please provide the password as an argument: node mongo.js <password>"
  );
  process.exit(1);
}

if (process.argv.length === 5) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  });

  mongoose
    .connect(url)
    .then((result) => {
      console.log("connected");
      return person.save();
    })
    .then(() => {
      console.log(`added ${person.name} number ${person.number} to phonebook`);
      return mongoose.connection.close();
    })
    .catch((err) => console.log(err));
}

if (process.argv.length === 3) {
  mongoose
    .connect(url)
    .then((result) => {
      Person.find({}).then((people) => {
        people.forEach((person) => console.log(person));
        mongoose.connection.close();
      });
    })
    .catch((err) => console.log(err));
}
