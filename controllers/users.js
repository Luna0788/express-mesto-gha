const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');

const {
  CREATED_CODE,
} = require('../utils/constants');

// create user
module.exports.createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10).then((hash) => User.create({
    name,
    about,
    avatar,
    email,
    password: hash,
  }))
    .then(() => res.status(CREATED_CODE).send({
      data: {
        name, about, avatar, email,
      },
    }))
    .catch((err) => {
      if (err.code === 11000) {
        return next(new ConflictError('Пользователь с таким email уже существует'));
      }
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Некорректные данные пользователя'));
      }
      return next(err);
    });
};

// find and return all users
module.exports.getAllUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
};

// find and return user by id
module.exports.getUser = (req, res, next) => {
  const { userId } = req.params;

  User.findById(userId)
    .orFail(() => new NotFoundError('Пользователь по указанному _id не найден.'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Некорректный id пользователя.'));
      }

      next(err);
    });
};

// get current user
module.exports.getCurrentUser = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .orFail(() => new NotFoundError('Текущий пользователь не найден.'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Некорректный id пользователя'));
      }

      next(err);
    });
};

// update user info
module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true, upsert: false })
    .orFail(() => new NotFoundError('Пользователь по указанному _id не найден.'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Некорректный id пользователя'));
      }
      next(err);
    });
};

// update avatar
module.exports.updateAvatar = (req, res, next) => {
  const userId = req.user._id;
  const { avatar } = req.body;
  User.findByIdAndUpdate(userId, { avatar }, { new: true })
    .orFail(() => new NotFoundError('Пользователь по указанному _id не найден.'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Некорректный id пользователя'));
      }

      next(err);
    });
};

// login
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      res.cookie('token', token, { maxAge: 3600000, httpOnly: true }).send({ token });
    })
    .catch(next);
};

// logout
module.exports.logout = (req, res) => {
  res.clearCookie('token').send({ message: 'Выход' });
};
