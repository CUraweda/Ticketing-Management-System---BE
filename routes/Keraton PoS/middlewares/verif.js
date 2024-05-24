const { error } = require("../../utils/response");

const jwt = require("jsonwebtoken");

const verif = (req, res, next) => {
  const app = require("../../../app");
  const token = req.headers["authorization"];

  if (!token) {
    return error(res, "Token tidak tersedia!", 401);
  }

  jwt.verify(token, process.env.SECRET_KEY_AUTH, (err, decoded) => {
    if (err) {
      return error(res, "Token tidak valid!", 401);
    }
    req.user = decoded;
    app.locals.userId = req.user.id
    next();
  });
};

module.exports = { verif };
