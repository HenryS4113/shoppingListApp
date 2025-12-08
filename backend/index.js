require("dotenv").config();
const express = require("express");
const Item = require("./models/item");
const cors = require("cors");

const app = express();
app.use(cors());

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

app.use(express.static("dist"));
app.use(express.json());
app.use(requestLogger);

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/items", (request, response) => {
  Item.find({}).then((items) => {
    response.json(items);
  });
});

app.get("/api/items/:id", (request, response, next) => {
  Item.findById(request.params.id)
    .then((item) => {
      if (item) {
        response.json(item);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.post("/api/items", (request, response) => {
  const body = request.body;

  if (!body.content) {
    return response.status(400).json({ error: "content missing" });
  }

  const item = new Item({
    content: body.content,
    important: body.important || false,
    quantity: body.quantity || 1,
    purchased: body.purchased || false,
  });

  item.save().then((savedItem) => {
    response.json(savedItem);
  });
});

app.put("/api/items/:id", (request, response, next) => {
  const { content, important, quantity, purchased } = request.body;

  Item.findById(request.params.id)
    .then((item) => {
      if (!item) {
        return response.status(404).end();
      }

      item.content = content;
      item.important = important;
      item.quantity = quantity;
      item.purchased = purchased;

      return item.save().then((updatedItem) => {
        response.json(updatedItem);
      });
    })
    .catch((error) => next(error));
});

app.delete("/api/items/:id", (request, response, next) => {
  Item.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT || 5010;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
