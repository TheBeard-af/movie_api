console.log("index.js loaded"); //debug asssit
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
  // .connect("mongodb://127.0.0.1:27017/myFlixDB", {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  // })
  .connect(process.env.CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("CONNECTED to moviesDB");
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { check, validationResult } = require("express-validator");

const cors = require("cors");

app.use(cors());

// let allowedOrigins = ["http://localhost:8080", "http://testsite.com"];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) === -1) {
//         // If a specific origin isn’t found on the list of allowed origins
//         let message =
//           "The CORS policy for this application doesn’t allow access from origin " +
//           origin;
//         return callback(new Error(message), false);
//       }
//       return callback(null, true);
//     },
//   })
// );

let auth = require("./auth")(app);

const passport = require("passport");
require("./passport");

// Get all Movies
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error:" + err);
      });
  }
);

// Return movie data for one movie by title
app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ Title: req.params.title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get genre description
app.get(
  "/movies/genre/:genreName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
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
  }
);

// Director Data
app.get(
  "/movies/directors/:directorName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
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
  }
);

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
app.post(
  "/users",
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check(
      "Password",
      "Password is required and must be at least 8 characters long"
    ).isLength({ min: 8 }),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  async (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + "already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
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
  }
);

// update user info by user
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  [
    // Validation for update endpoint
    check("Username", "Username must be at least 5 characters long")
      .optional()
      .isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non-alphanumeric characters - not allowed."
    )
      .optional()
      .isAlphanumeric(),
    check("Password", "Password must be at least 8 characters long")
      .optional()
      .isLength({ min: 8 }),
    check("Email", "Email does not appear to be valid").optional().isEmail(),
    check("Birthday", "Birthday must be a valid date")
      .optional()
      .isISO8601()
      .toDate(),
  ],
  async (req, res) => {
    // Check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    if (req.params.Username !== req.user.Username) {
      return res
        .status(400)
        .send("Permission denied: You cannot update another user's profile.");
    }

    let hashedPassword;
    if (req.body.Password) {
      hashedPassword = Users.hashPassword(req.body.Password);
    }

    //  build the update object to only include fields that are provided
    const updateFields = {};
    if (req.body.Username) updateFields.Username = req.body.Username;
    if (hashedPassword) updateFields.Password = hashedPassword; // Use the hashed password
    if (req.body.Email) updateFields.Email = req.body.Email;
    if (req.body.Birthday) updateFields.Birthday = req.body.Birthday;

    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $set: updateFields }, // Use the created updateFields object
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
  }
);

// Add movie to user favorite list
app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
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
  }
);

// delete movie from user favorite list
app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
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
  }
);

// deregister user
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
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
  }
);

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

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
