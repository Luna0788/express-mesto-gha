const jwt = require('jsonwebtoken');

const AuthError = require('../errors/AuthError');

module.exports = (req, res, next) => {
  // const { authorization } = req.headers;

  // if (!authorization || !authorization.startsWith('Bearer ')) {
  //   next(new AuthError('Необходима авторизация'));
  // }

  // const token = authorization.replace('Bearer ', '');
  const { token } = req.cookies;
  if (!token) {
    next(new AuthError('Необходима авторизация'));
  }

  let payload;
  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (err) {
    next(new AuthError('Необходима авторизация'));
  }

  req.user = payload;
  next();
};
