const Card = require('../models/card');

const {
  BAD_REQUEST_CODE,
  NOT_FOUND_CODE,
  INTERNAL_SERVER_ERROR_CODE,
  CREATED_CODE,
} = require('../utils/constants');

// find and return all cards
module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};

// create card
module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.status(CREATED_CODE).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST_CODE).send({ message: err.message });
      }
      return res.status(INTERNAL_SERVER_ERROR_CODE).send({ message: 'Ошибка сервера.' });
    });
};

// delete card by id
module.exports.deleteCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndDelete(cardId)
    .then((card) => {
      if (!card) {
        return res.status(NOT_FOUND_CODE).send({ message: 'Карточка с указанным _id не найдена.' });
      }
      return res.send({ message: 'Карточка удалена' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(BAD_REQUEST_CODE).send({ message: err.message });
      }
      return res.status(INTERNAL_SERVER_ERROR_CODE).send({ message: 'Ошибка сервера.' });
    });
};

// add likes
module.exports.likeCard = (req, res) => {
  const { cardId } = req.params;
  Card
    .findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true, runValidators: true },
    )
    .then((card) => {
      if (!card) {
        return res.status(NOT_FOUND_CODE).send({ message: 'Передан несуществующий _id карточки.' });
      }
      return res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(BAD_REQUEST_CODE).send({ message: err.message });
      }
      return res.status(INTERNAL_SERVER_ERROR_CODE).send({ message: 'Ошибка сервера.' });
    });
};

// delete like
module.exports.dislikeCard = (req, res) => {
  const { cardId } = req.params;
  Card
    .findByIdAndUpdate(
      cardId,
      { $pull: { likes: req.user._id } },
      { new: true, runValidators: true },
    )
    .then((card) => {
      if (!card) {
        return res.status(NOT_FOUND_CODE).send({ message: 'Передан несуществующий _id карточки.' });
      }
      return res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(BAD_REQUEST_CODE).send({ message: err.message });
      }
      return res.status(INTERNAL_SERVER_ERROR_CODE).send({ message: 'Ошибка сервера.' });
    });
};
