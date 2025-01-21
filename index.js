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
      title: 'Rush'
    },
    {
      title: 'Click'
    },
    {
      title: 'Speed'
    },
    {
      title: 'The Matrix'
    },
    {
      title: 'Twilight'
    },
    {
      title: 'Terminator 2: Judgment Day'
    },
    {
      title: 'If'
    },
    {
      title: 'Oblivion'
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

  const port = process.env.PORT || 8080;

app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port' + port);
});