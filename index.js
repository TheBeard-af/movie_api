const express = require("express"),
  morgan = require("morgan");
const app = express(),
  bodyParser = require("body-parser"),
  uuid = require("uuid");

app.use(bodyParser.json());

let users = [
  {
    id: 1,
    name: "Kim",
    favouriteMovies: [],
  },
  {
    id: 2,
    name: "Joe",
    favouriteMovies: [],
  },
];

let movies = [
  {
    Title: "The Matrix",
    Description: "A dystopian future with advanced AI.",
    Genre: { Name: "action", Description: "Shooting and stuff" },
    Director: {
      Name: "Lana Wachowski",
      Bio: "Visionary filmmaker.",
      Birth: 1965,
    },
  },
  {
    Title: "Rush",
    Description: "",
    Genre: { Name: "", Description: "" },
    Director: {
      Name: "",
      Bio: "",
      Birth: 1 
    }
  },
  {
    Title: "Hope",
    Description: "",
    Genre: { Name: "", Description: "" },
    Director: {
      Name: "",
      Bio: "",
      Birth: 1 
    }
  },
  {
    Title: "Click",
    Description: "",
    Genre: { Name: "", Description: "" },
    Director: {
      Name: "",
      Bio: "",
      Birth: 1 
    }
  },

];

// create
app.post("/user", (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send("users need names");
  }
});

// read
app.get("/user/:id", (req, res) => {
  const { id } = req.params;
  const updateUser = req.body;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.name = updateUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send("no such user");
  }
});

// update
app.put("/user/:id", (req, res) => {
  const { id } = req.params;
  const updateUser = req.body;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.name = updateUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send("no such user");
  }
});

// create
app.post("/user/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favouriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  } else {
    res.status(400).send("no such user");
  }
});

// delete
app.delete("/user/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favouriteMovies = user.favouriteMovies.filter(
      (title) => title !== movieTitle
    );
    res
      .status(200)
      .send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send("no such user");
  }
});

// delete
app.delete("/user/:id", (req, res) => {
  const { id } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    users = users.filter((user) => user.id != id);
    res.status(200).send(` user ${id} has been deleted`);
  } else {
    res.status(400).send("no such user");
  }
});

// read
app.get("/movies", (req, res) => {
  res.status(200).json(movies);
});

// read
app.get("/movies/:title", (req, res) => {
  const { title } = req.params;
  const movie = movies.find((movie) => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("no such movie");
  }
});

// read
app.get("/movies/genre/:genreName", (req, res) => {
  const { genreName } = req.params;
  const genre = movies.filter((movie) => movie.Genre.Name === genreName);

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send("no such genre");
  }
});

// read
app.get("/movies/directors/:directorName", (req, res) => {
  const { directorName } = req.params;
  const director = movies.find(
    (movie) => movie.Director.Name === directorName
  ).Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send("no such movie");
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to my movie app!");
});

app.use("/documentation", express.static("public"));

app.use(morgan("common"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// const port = process.env.PORT || 8080;

app.listen(8080, () => console.log("Listening on Port 8080"));
