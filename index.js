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

app.get("/info", (request, response) => {
  Person.count({}, (err, count) => {
    response.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${new Date()}</p>
    `);
  });
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((people) => {
    response.json(people);
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      person ? response.json(person) : response.status(404).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const { name, number } = request.body;

  !request.body && response.status(400).json({ error: "content is missing" });
  !name && response.status(400).json({ error: "name is missing" });
  !number && response.status(400).json({ error: "number is missing" });

  const person = new Person({
    name: name,
    number: number,
  });
  
  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => response.status(204).end())
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "person not found" });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if ( error.name === 'MongoServerError') {
    return response.status(400).json({ error: error.message })
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
