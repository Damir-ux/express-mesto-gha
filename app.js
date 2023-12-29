const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/testdb' } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use((req, res, next) => {
  req.user = {
    _id: '658d36660edc1f80228c3144',
  };

  next();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));