const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
// const AuthError = require('../errors/AuthError');
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
        // return res.status(BAD_REQUEST_CODE).send({ message: err.message });
      }
      return next(err);
      // return res.status(INTERNAL_SERVER_ERROR_CODE).send({ message: 'Ошибка сервера.' });
    });
};

// find and return all users
module.exports.getAllUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    // .catch(() => res.status(INTERNAL_SERVER_ERROR_CODE).send({ message: 'Ошибка сервера.' }));
    .catch(next);
};

// find and return user by id
module.exports.getUser = (req, res, next) => {
  const { userId } = req.params;

  User.findById(userId)
    .orFail(new Error('NotValidId'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        // return res.status(BAD_REQUEST_CODE).send({ message: err.message });
        next(new BadRequestError('Некорректный id пользователя.'));
      }
      if (err.message === 'NotValidId') {
      // return res.status(NOT_FOUND_CODE)
      // .send({ message: 'Пользователь по указанному _id не найден.' });
        next(new NotFoundError('Пользователь по указанному _id не найден.'));
      }
      // return res.status(INTERNAL_SERVER_ERROR_CODE).send({ message: 'Ошибка сервера.' });
      next(err);
    });
};

// get current user
module.exports.getCurrentUser = (req, res, next) => {
  const { userId } = req.user._id;
  console.log(userId);
  User.findById(userId)
    .orFail(new Error('NotValidId'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        // return res.status(BAD_REQUEST_CODE).send({ message: err.message });
        next(new BadRequestError('Некорректный id пользователя'));
      }
      if (err.message === 'NotValidId') {
      //   return res.status(NOT_FOUND_CODE).send({ message: 'Текущий пользователь не найден.' });
        next(new NotFoundError('Текущий пользователь не найден.'));
      }
      // return res.status(INTERNAL_SERVER_ERROR_CODE).send({ message: 'Ошибка сервера.' });
      next(err);
    });
};

// update user info
module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true, upsert: false })
    .orFail(new Error('NotValidId'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        // return res.status(BAD_REQUEST_CODE).send({ message: err.message });
        next(new BadRequestError('Некорректный id пользователя'));
      }
      if (err.message === 'NotValidId') {
      //   return res.status(NOT_FOUND_CODE)
      // .send({ message: 'Пользователь по указанному _id не найден.' });
        next(new NotFoundError('Пользователь по указанному _id не найден.'));
      }
      // return res.status(INTERNAL_SERVER_ERROR_CODE).send({ message: 'Ошибка сервера.' });
      next(err);
    });
};

// update avatar
module.exports.updateAvatar = (req, res, next) => {
  const userId = req.user._id;
  const { avatar } = req.body;
  User.findByIdAndUpdate(userId, { avatar }, { new: true })
    .orFail(new Error('NotValidId'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        // return res.status(BAD_REQUEST_CODE).send({ message: err.message });
        next(new BadRequestError('Некорректный id пользователя'));
      }
      if (err.message === 'NotValidId') {
      //   return res.status(NOT_FOUND_CODE)
      // .send({ message: 'Пользователь по указанному _id не найден.' });
        next(new NotFoundError('Пользователь по указанному _id не найден.'));
      }
      // return res.status(INTERNAL_SERVER_ERROR_CODE).send({ message: 'Ошибка сервера.' });
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
