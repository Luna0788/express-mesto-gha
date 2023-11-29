const userRouter = require('express').Router();

const {
  getAllUsers,
  getUser,
  updateUser,
  updateAvatar,
  getCurrentUser,
} = require('../controllers/users');

const { validationGetUser, validationUpdateUser, validationUpdateAvatar } = require('../middlewares/validation');

userRouter.get('/', getAllUsers);
userRouter.get('/:userId', validationGetUser, getUser);
userRouter.get('/me', getCurrentUser);
userRouter.patch('/me', validationUpdateUser, updateUser);
userRouter.patch('/me/avatar', validationUpdateAvatar, updateAvatar);

module.exports = userRouter;
