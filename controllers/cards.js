const http2 = require('http2');
const mongoose = require('mongoose');
const Card = require('../models/card');
const card = require('../models/card');

const {
  HTTP_STATUS_OK,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
} = http2.constants;

module.exports.addCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      Card.findById(card._id)
        .orFail()
        .populate('owner')
        .then((data) => res.status(HTTP_STATUS_OK).send(data))

        .catch((err) => {
          if (err instanceof mongoose.Error.DocumentNotFoundError) {
            res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка не найдена' });
          } else {
            res
              .status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
              .send({ message: 'На сервере произошла ошибка' });
          }
        });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: err.message });
      } else {
        res
          .status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.getCards = (req, res) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.status(HTTP_STATUS_OK).send(cards))
    .catch(() => res
      .status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: 'На сервере произошла ошибка' }));
};

module.exports.deleteCard = (req, res) => {
  Card.findByI(req.params.cardId)
    .then((card) => {
      if (!card.owner.equals(req.user._id)) {

      }

      Card.deleteOne(card)
        .orFail()
        .then(() => {
          res.send({ message: 'Карточка удалена' });
        })
        .catch((err) => {
          if (err instanceof mongoose.Error.DocumentNotFoundError) {
            res
              .status(HTTP_STATUS_NOT_FOUND)
              .send({ message: 'Карточка не найдена' });
          } else if (err instanceof mongoose.Error.CastError) {
            res
              .status(HTTP_STATUS_BAD_REQUEST)
              .send({ message: 'Неправильный _id карточки' });
          } else {
            res
              .status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
              .send({ message: 'На сервере произошла ошибка' });
          }
        });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .populate(['owner', 'likes'])
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.DocumentNotFoundError) {
        res
          .status(HTTP_STATUS_NOT_FOUND)
          .send({ message: 'Карточка не найдена' });
      } else if (err instanceof mongoose.Error.CastError) {
        res
          .status(HTTP_STATUS_BAD_REQUEST)
          .send({ message: 'Неправильный _id карточки' });
      } else {
        res
          .status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .populate(['owner', 'likes'])
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.DocumentNotFoundError) {
        res
          .status(HTTP_STATUS_NOT_FOUND)
          .send({ message: 'Карточка не найдена' });
      } else if (err instanceof mongoose.Error.CastError) {
        res
          .status(HTTP_STATUS_BAD_REQUEST)
          .send({ message: 'Неправильный _id карточки' });
      } else {
        res
          .status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send({ message: 'На сервере произошла ошибка' });
      }
    });
};
