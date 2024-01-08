const http2 = require("http2");
const Card = require("../models/card");

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
        .populate("owner")
        .then((data) => res.status(HTTP_STATUS_OK).send(data))
        .catch(() =>
          res
            .status(HTTP_STATUS_NOT_FOUND)
            .send({ message: "Пользователь по указанному _id не найден" })
        );
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: err.message });
      } else {
        res
          .status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send({ message: "На сервере произошла ошибка" });
      }
    });
};

module.exports.getCards = (req, res) => {
  Card.find({})
    .populate(["owner", "likes"])
    .then((cards) => res.status(HTTP_STATUS_OK).send(cards))
    .catch(() =>
      res
        .status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
        .send({ message: "На сервере произошла ошибка" })
    );
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(new Error("DocumentNotFoundError"))
    .then(() => {
      res.send({ message: "Карточка удалена" });
    })
    .catch((err) => {
      if (err.name === "DocumentNotFoundError" || err.name === "CastError") {
        res
          .status(HTTP_STATUS_NOT_FOUND)
          .send({ message: "Карточка с указанным _id не найдена" });
      } else {
        res
          .status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send({ message: "На сервере произошла ошибка" });
      }
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail(new Error("DocumentNotFoundError"))
    .populate(["owner", "likes"])
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err.name === "DocumentNotFoundError" || err.name === "CastError") {
        res
          .status(HTTP_STATUS_NOT_FOUND)
          .send({ message: "Карточка с указанным _id не найдена" });
      } else {
        res
          .status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send({ message: "На сервере произошла ошибка" });
      }
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail(new Error("DocumentNotFoundError"))
    .populate(["owner", "likes"])
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err.name === "DocumentNotFoundError" || err.name === "CastError") {
        res
          .status(HTTP_STATUS_NOT_FOUND)
          .send({ message: "Карточка с указанным _id не найдена" });
      } else {
        res
          .status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send({ message: "На сервере произошла ошибка" });
      }
    });
};
