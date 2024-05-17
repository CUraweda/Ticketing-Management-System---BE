const { throwError } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getUser = async (name) => {
  try {
    return await prisma.user.findFirst({ where: { name: name } });
  } catch (err) {
    throwError(err);
  }
};
const isExist = async (id) => {
  try {
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
    const token = jwt.sign(user, process.env.SECRET_KEY_AUTH);
    return token;
  } catch (err) {
    throwError(err);
  }
};
const signUp = async (data) => {
  try {
    return await prisma.user.create({ data: data });
  } catch (err) {
    throwError(err);
  }
};

module.exports = { getUser, isExist, logIn, signUp };
