const http2 = require('http2');
const mongoose = require('mongoose');

const {
  HTTP_STATUS_OK,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
} = http2.constants;
const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(HTTP_STATUS_OK).send(users))
    .catch(() => res
      .status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: 'Произошла ошибка на сервере' }));
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        res
          .status(HTTP_STATUS_NOT_FOUND)
          .send({ message: 'Пользователь по указанному _id не найден' });
        return;
      }
      res.status(HTTP_STATUS_OK).send(user);
    })
    .catch(() => res
      .status(HTTP_STATUS_NOT_FOUND)
      .send({ message: 'Пользователь по указанному _id не найден' }));
};

module.exports.addUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.status(HTTP_STATUS_CREATED).send(user))
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

module.exports.editUserData = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: 'true', runValidators: true },
  )
    .orfail()
    .then((user) => res.status(HTTP_STATUS_OK).send(user))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: err.message });
      } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
        res
          .status(HTTP_STATUS_NOT_FOUND)
          .send({ message: 'Пользователь не найден' });
      } else {
        res
          .status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.editUserAvatar = (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    { avatar: req.body.avatar },
    { new: 'true', runValidators: true },
  )
    .orfail()
    .then((user) => res.status(HTTP_STATUS_OK).send(user))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: err.message });
      } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Пользователь не найден' });
      } else {
        res
          .status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send({ message: 'На сервере произошла ошибка' });
      }
    });
};
