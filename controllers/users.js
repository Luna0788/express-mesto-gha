const User = require('../models/user');

const {
  BAD_REQUEST_CODE,
  NOT_FOUND_CODE,
  INTERNAL_SERVER_ERROR_CODE,
  CREATED_CODE,
} = require('../utils/constants');

// create user
module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.status(CREATED_CODE).send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST_CODE).send({ message: err.message });
      }
      return res.status(INTERNAL_SERVER_ERROR_CODE).send({ message: 'Ошибка сервера.' });
    });
};

// find and return all users
module.exports.getAllUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(() => res.status(INTERNAL_SERVER_ERROR_CODE).send({ message: 'Ошибка сервера.' }));
};

// find and return user by id
module.exports.getUser = (req, res) => {
  const { userId } = req.params;

  User.findById(userId)
    .orFail(new Error('NotValidId'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(BAD_REQUEST_CODE).send({ message: err.message });
      }
      if (err.message === 'NotValidId') {
        return res.status(NOT_FOUND_CODE).send({ message: 'Пользователь по указанному _id не найден.' });
      }
      return res.status(INTERNAL_SERVER_ERROR_CODE).send({ message: 'Ошибка сервера.' });
    });
};

// update user info
module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true, upsert: false })
    .orFail(new Error('NotValidId'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST_CODE).send({ message: err.message });
      }
      if (err.message === 'NotValidId') {
        return res.status(NOT_FOUND_CODE).send({ message: 'Пользователь по указанному _id не найден.' });
      }
      return res.status(INTERNAL_SERVER_ERROR_CODE).send({ message: 'Ошибка сервера.' });
    });
};

// update avatar
module.exports.updateAvatar = (req, res) => {
  const userId = req.user._id;
  const { avatar } = req.body;
  User.findByIdAndUpdate(userId, { avatar }, { new: true })
    .orFail(new Error('NotValidId'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST_CODE).send({ message: err.message });
      }
      if (err.message === 'NotValidId') {
        return res.status(NOT_FOUND_CODE).send({ message: 'Пользователь по указанному _id не найден.' });
      }
      return res.status(INTERNAL_SERVER_ERROR_CODE).send({ message: 'Ошибка сервера.' });
    });
};
