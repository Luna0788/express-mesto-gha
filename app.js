const express = require('express');
// const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const router = require('./routes');

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;
const app = express();

app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  req.user = {
    _id: '6555e9e3ab95342e156ac11c',
  };

  next();
});

mongoose.connect(DB_URL);

app.use(router);
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
