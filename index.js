require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

const Person = require("./models/person");

morgan.token("requestBody", (request, response) => {
  return JSON.stringify(request.body);
});

app.use(express.json());
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :requestBody"
  )
);
app.use(cors());
app.use(express.static("build"));

app.get('/info', (request, response) => {
    response.send(`
        <p>Phonebook has info for ${Person.count.length} people</p>
        <p>${new Date()}</p>
    `);
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((people) => {
    response.json(people);
  });
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id).then((person) => {
    person
      ? response.json(person)
      : response.status(404).json({ error: "person not found" }).end();
  });
});

app.post("/api/persons", (request, response) => {
  const body = request.body;

  !body && response.status(400).json({ error: "content is missing" });

  !body.name && response.status(400).json({ error: "name is missing" });

  !body.number && response.status(400).json({ error: "number is missing" });

//   persons.find((person) => person.name === body.name) &&
//     response.status(400).json({ error: "name must be unique" });

  const newPerson = {
    name: body.name,
    number: body.number,
  };

  Person.create(newPerson);

  response.json(newPerson);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = +request.params.id;
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
