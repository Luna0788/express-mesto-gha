const express = require('express');
// const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const router = require('./routes');
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const error = require('./middlewares/error');

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;
const app = express();
app.use(bodyParser.json());
mongoose.connect(DB_URL);

app.post('/signin', login);
app.post('/signup', createUser);
app.use(auth);

app.use(router);

app.use(error);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
