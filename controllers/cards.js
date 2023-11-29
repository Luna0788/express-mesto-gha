const Card = require('../models/card');

const {
  CREATED_CODE,
} = require('../utils/constants');
const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');
const NotFoundError = require('../errors/NotFoundError');

// find and return all cards
module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(next);
};

// create card
module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.status(CREATED_CODE).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        // return res.status(BAD_REQUEST_CODE).send({ message: err.message });
        next(new BadRequestError('Некорректные данные при создании карточки'));
      }
      // return res.status(INTERNAL_SERVER_ERROR_CODE).send({ message: 'Ошибка сервера.' });
      next(err);
    });
};

// delete card by id
module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  Card.findById(cardId)
    .orFail(new Error('NotValidId'))
    .then((card) => {
      if (!card.owner.equals(req.user._id)) {
        // return res.status(UNAUTHORIZED_CODE)
        // .send({ message: 'Невозможно удалить чужую карточку' });
        return next(new ForbiddenError('Невозможно удалить чужую карточку'));
      }
      return card.remove()
        .then(() => res.send({ message: 'Карточка удалена' }));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        // return res.status(BAD_REQUEST_CODE).send({ message: err.message });
        next(new BadRequestError('Некорректный id карточки'));
      }
      if (err.message === 'NotValidId') {
        // return res.status(NOT_FOUND_CODE)
        // .send({ message: 'Карточка с указанным _id не найдена.' });
        next(new NotFoundError('Карточка с указанным _id не найдена.'));
      }
      // return res.status(INTERNAL_SERVER_ERROR_CODE).send({ message: 'Ошибка сервера.' });
      next(err);
    });
};

// add likes
module.exports.likeCard = (req, res, next) => {
  const { cardId } = req.params;
  Card
    .findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true, runValidators: true },
    )
    .orFail(new Error('NotValidId'))
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        // return res.status(BAD_REQUEST_CODE).send({ message: err.message });
        next(new BadRequestError('Некорректный id карточки'));
      }
      if (err.message === 'NotValidId') {
        // return res.status(NOT_FOUND_CODE)
        // .send({ message: 'Передан несуществующий _id карточки.' });
        next(new NotFoundError('Карточка с указанным _id не найдена.'));
      }
      // return res.status(INTERNAL_SERVER_ERROR_CODE).send({ message: 'Ошибка сервера.' });
      next(err);
    });
};

// delete like
module.exports.dislikeCard = (req, res, next) => {
  const { cardId } = req.params;
  Card
    .findByIdAndUpdate(
      cardId,
      { $pull: { likes: req.user._id } },
      { new: true, runValidators: true },
    )
    .orFail(new Error('NotValidId'))
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        // return res.status(BAD_REQUEST_CODE).send({ message: err.message });
        next(new BadRequestError('Некорректный id карточки'));
      }
      if (err.message === 'NotValidId') {
        // return res.status(NOT_FOUND_CODE)
        // .send({ message: 'Передан несуществующий _id карточки.' });
        next(new NotFoundError('Передан несуществующий _id карточки.'));
      }
      // return res.status(INTERNAL_SERVER_ERROR_CODE).send({ message: 'Ошибка сервера.' });
      next(err);
    });
};
