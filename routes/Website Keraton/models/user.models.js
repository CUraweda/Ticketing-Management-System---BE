const { throwError } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getUser = async (email) => {
  try {
    return await prisma.user.findFirst({ where: { email } });
  } catch (err) {
    throwError(err);
  }
};

const getAll = async () => {
  try {
    return await prisma.user.findMany({ where: { deleted: false } })
  } catch (err) {
    throwError(err)
  }
}

const isExist = async (id) => {
  try {
    id = id?.id ? id.id : id
    return await prisma.user.findFirst({ where: { id } });
  } catch (err) {
    throwError(err);
  }
};
const logIn = async (body) => {
  const { email, password } = body;
  try {
    const user = await getUser(email);
    if (!user) throw new Error("Email tidak ditemukan!");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Password tidak sesuai");

    const token = jwt.sign(user, process.env.SECRET_KEY_AUTH);
    await prisma.token.create({ data: { token, userId: user.id } })
    delete user.password
    delete user.id
    return { token, user };
  } catch (err) {
    throwError(err);
  }
};
const emailExist = async (email) => {
  try {
    return await prisma.user.findFirst({ where: { email } })
  } catch (err) {
    throwError(err)
  }
}
const signUp = async (data) => {
  try {
    const { email, password, name } = data;
    const emailAlreadyExist = await emailExist(email)
    if (emailAlreadyExist) throw Error('Email Already exist')
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "CUSTOMER",
      },
    });

    const newDataForLog = {
      email: newUser.email,
      password: password,
    };

    data = await logIn(newDataForLog);
    return data;
  } catch (err) {
    throwError(err);
  }
};
const update = async (id, data) => {
  try {
    return await prisma.user.update({ where: { id }, data })
  } catch (err) {
    throwError(err)
  }
}
const updatePassword = async (id, data) => {
  try {
    const { password, oldpassword } = data
    const userExist = await prisma.user.findFirst({ where: { id } })
    if (!userExist) throw Error('Id User tidak ada')

    const validPassword = bcrypt.compare(oldpassword, userExist.password)
    if (!validPassword) throw Error("Old Password salah")

    if (!data.password) throw Error("Tidak ada data password yang dikirim")
    data.password = bcrypt.hash(data.password, 10)

    return await prisma.user.update({ where: { id }, data: { password: data.password } })
  } catch (err) {
    throwError(err)
  }
}

const create = async (data) => {
  try {
    const emailAlreadyExist = await emailExist(data.email)
    if (emailAlreadyExist) throw Error('Email already exist')
    const salt = await bcrypt.genSalt()
    data.password = await bcrypt.hash(data.password, salt)
    return await prisma.user.create({ data })
  } catch (err) {
    throwError(err)
  }
}

const logOUt = async (token) => {
  try {
    const isExist = await prisma.token.findFirst({ where: { token } })
    if (!isExist) throw Error('Token didnt exist in db')
    return await prisma.token.delete({ where: { id: isExist.id } })
  } catch (err) {
    throwError(err)
  }
}

const deleteSoftUser = async (id) => {
  try {
    return await prisma.user.update({ where: { id }, data: { deleted: true } })
  } catch (err) {
    throwError(err)
  }
}

module.exports = { getUser, isExist, logIn, signUp, update, logOUt, getAll, deleteSoftUser, create, updatePassword, emailExist };
