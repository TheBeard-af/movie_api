const express = require('express'),
morgan = require('morgan');

const app = express();

let movies = [
    {
      title: 'Harry Potter and the Sorcerer\'s Stone'
    },
    {
      title: 'Lord of the Rings'
    },
    {
      title: 'Twilight'
    }
  ];

  // GET requests
  app.get('/movies', (req, res) => {
    res.json(movies);
  });

  app.get('/', (req, res) => {
    res.send('Welcome to my movie app!');
  });

  app.use('/documentation', express.static('public'));

  app.use(morgan('common'));

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });