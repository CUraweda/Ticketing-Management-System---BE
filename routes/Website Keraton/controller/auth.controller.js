var express = require("express");
var router = express.Router();
const { error, success } = require("../../utils/response");
const userModel = require("../models/user.models");
const { auth } = require("../middlewares/auth");

router.post("/register", async (req, res) => {
  try {
    const data = await userModel.signUp(req.body);
    return success(res, "Register akun berhasil", data);
  } catch (err) {
    return error(res, err.message);
  }
});

router.get('/logout', auth([]), async (req, res) => {
  try{
    const deletedToken = await userModel.logOUt(req.token)
    return success(res, 'Log Out Success', deletedToken)
  }catch(err){
    return error(res, err.message)
  }
})

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return error(res, "Name and password are required.");
  }

  if (password.length < 6) {
    return error(res, "password must be more than 6 characters or more")
  }

  try {
    const data = await userModel.logIn(req.body);
    return success(res, "Login berhasil", data);
  } catch (err) {
    return error(res, err.message);
  }
});

router.get("/auth", auth([]), async (req, res) => {
  try {
    return success(res, "Autentikasi berhasil!", req.user);
  } catch (err) {
    return error(res, err.message);
  }
});

module.exports = router;
