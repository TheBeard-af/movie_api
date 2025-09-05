console.log("index.js loaded");//debug asssit
const express = require("express"),
  bodyParser = require("body-parser"),
  uuid = require("uuid");

const morgan = require("morgan");
const app = express();
const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

mongoose
  .connect("mongodb://127.0.0.1:27017/myFlixDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("CONNECTED to moviesDB");
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');


// Get all Movies
app.get("/movies", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error:" + err);
    });
});

// Return movie data for one movie by title
app.get("/movies/:title", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.findOne({ Title: req.params.title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get genre description
app.get("/movies/genre/:genreName", passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { genreName } = req.params;

  try {
    const movie = await Movies.findOne({ "Genre.Name": genreName });
    if (movie) {
      res.status(200).json(movie.Genre);
    } else {
      res.status(404).send("Genre not found");
    }
  } catch (err) {
    console.error("Error finding genre:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Director Data
app.get("/movies/directors/:directorName", passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { directorName } = req.params;

  try {
    const movie = await Movies.findOne({ "Director.Name": directorName });

    if (movie && movie.Director) {
      res.status(200).json(movie.Director);
    } else {
      res.status(404).send("Director not found");
    }
  } catch (err) {
    console.error("Error finding director:", err);
    res.status(500).send("Internal Server Error");
  }
});

// read
// app.get("/users", async (req, res) => {
//   await Users.find()
//     .then((users) => {
//       res.status(200).json(users);
//     })
//     .catch((err) => {
//       console.error(err);
//       res.status(500).send("Error: " + err);
//     });
// });

// Allow new users to regester
app.post("/users", async (req, res) => {
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + "already exists");
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        })
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send("Error: " + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

// update user info by user
app.put("/users/:Username", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
    },
    { new: true } // Return the updated document
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        res.status(404).send("User not found.");
      } else {
        res.json(updatedUser);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Add movie to user favorite list
app.post("/users/:Username/movies/:MovieID", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndUpdate(
    { Username: req.params.Username },
    { $addToSet: { FavoriteMovies: req.params.MovieID } }, // $addToSet prevents duplicates
    { new: true } // Return the updated document
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        res.status(404).send("User not found");
      } else {
        res.json(updatedUser);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// delete movie from user favorite list
app.delete("/users/:Username/movies/:MovieID", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndUpdate(
    { Username: req.params.Username },
    { $pull: { FavoriteMovies: req.params.MovieID } }, // Removes the MovieID from the array
    { new: true } // Returns the updated document
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        res.status(404).send("User not found");
      } else {
        res.json(updatedUser);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// deregister user
app.delete("/users/:Username", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const deletedUser = await Users.findOneAndDelete({
      Username: req.params.Username,
    });
    if (!deletedUser) {
      res.status(404).send(req.params.Username + " was not found");
    } else {
      res.status(200).send(req.params.Username + " was deleted.");
    }
  } catch (err) {
    console.error("DELETE /users/:Username error:", err);
    res.status(500).send("Error: " + err);
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
