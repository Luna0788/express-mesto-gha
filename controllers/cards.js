const Card = require('../models/card');

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
    .then((card) => res.send(card))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};

// delete card by id
module.exports.deleteCard = (req, res) => {
  const { cardID } = req.params;
  Card.findByIdAndRemove({ cardID })
    .then(() => res.send({ message: 'Карточка удалена' }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};

// add likes
module.exports.likeCard = (req, res) => {
  const { cardID } = req.params;
  Card
    .findByIdAndUpdate(
      cardID,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    )
    .then((card) => res.send(card))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};

// delete like
module.exports.dislikeCard = (req, res) => {
  const { cardID } = req.params;
  Card
    .findByIdAndUpdate(
      cardID,
      { $pull: { likes: req.user._id } },
      { new: true },
    )
    .then((card) => res.send(card))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};
