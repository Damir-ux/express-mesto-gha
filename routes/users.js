const router = require('express').Router();
const {
  getUsers, getUserById, addUser, editUserData, editUserAvatar,

} = require('../controllers/users');

router.get('/', getUsers);
router.get('/:userid', getUserById);
router.post('/', addUser);
router.patch('/me', editUserData);
router.patch('/me/avatar', editUserAvatar);

module.exports = router;
