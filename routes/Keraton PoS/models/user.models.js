const { throwError } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getUser = async (name) => {
  try {
    const users = await prisma.user.findMany({ where: { name: name } });
    const user = users.find((user) => user.name === name);
    return user;
  } catch (err) {
    throwError(err);
  }
};
const isExist = async (id) => {
  try {
    const app = require("../../../app");
    app.locals.userId = id;

    return await prisma.user.findFirst({
      where: { id: id },
    });
  } catch (err) {
    throwError(err);
  }
};
const logIn = async (body) => {
  let { name, password } = body;
  try {
    const user = await getUser(name);
    if (!user) throw Error("Username tidak ditemukan!");
    await bcrypt.compare(password, user.password).then((match) => {
      if (!match) throw Error("Password tidak sesuai");
    });
    if (user.role === "CUSTOMER") {
      throwError("User tidak memiliki akses!");
    }
    const userToken = {
      id: user.id,
      username: user.name,
    };
    const token = jwt.sign(userToken, process.env.SECRET_KEY_AUTH);
    return token;
  } catch (err) {
    throwError(err);
  }
};
const updateCarts = async (data) => {
  try {
    const carts = Object.assign(data.carts);
    const user = await getUser(data.user.name);
    if (!user) throw Error("User tidak ditemukan!");
    return await prisma.user.update({
      where: { id: user.id },
      data: { carts: carts },
    });
  } catch (err) {
    throwError(err);
  }
};
const forgotPassword = async (email) => {
  try{

  }catch(err){
    throwError(err)
  }
}

module.exports = { getUser, isExist, logIn, updateCarts };
