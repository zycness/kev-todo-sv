const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  let userExists;
  try {
    userExists = await User.findOne({ email: email });
  } catch (error) {
    console.log(error);
  }
  if (userExists) {
    return res
      .status(400)
      .json({ message: "Correo electrónico ya utilizado." });
  }

  const hashedPW = bcrypt.hashSync(toString(password));

  const user = new User({
    name,
    email,
    password: hashedPW,
    role: {
      user: true,
      admin: false,
    },
  });
  try {
    await user.save().then(() => {
      return res.status(201).json({ message: user });
    });
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  let userExists;
  try {
    userExists = await User.findOne({ email: email });
  } catch (error) {
    return new Error(error);
  }
  if (!userExists) {
    return res.status(400).json({
      message: "Usuario no encontrado. Revise su correo y contraseña.",
    });
  }

  const isPasswordCorrect = bcrypt.compareSync(
    toString(password),
    userExists.password
  );
  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Contraseña inválida" });
  }

  const token = jwt.sign({ id: userExists._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1d",
    algorithm: "HS256",
  });

  res.cookie(String(userExists._id), token, {
    path: "/",
    expires: new Date(Date.now() + 86400000),
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });

  return res.status(200).json({
    message: "Inicio de sesión correcto",
    user: userExists,
    token: token,
  });
};

const verifyToken = async (req, res, next) => {
  try {
    const cookies = req.headers.cookie;

    if (!cookies) {
      return res.status(404).json({ message: "Token no encontrado" });
    }
    const token = cookies.split("=")[1];
    jwt.verify(String(token), process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(400).json({ message: "Token inválido" });
      }
      req.id = user.id;
    });
  } catch (error) {
    res.status(404).json({ message: "Token no encontrado." });
  }
  next();
};

const getUser = async (req, res) => {
  const userId = req.id;
  let user;
  try {
    user = await User.findById(userId, "-password");
  } catch (error) {
    return new Error(error);
  }
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }
  return res.status(200).json({ user });
};

const logOut = async (req, res) => {
  const cookies = req.headers.cookie;
  if (!cookies) {
    return res.status(404).json({ message: "Token no encontrado" });
  }
  const token = cookies.split("=")[1];
  jwt.verify(String(token), process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(400).json({ message: "Token inválido" });
    }
    res.clearCookie(String(user.id), { sameSite: "None", secure: true });
    res.cookie[String(user.id)] = "";
    console.log("Sesión cerrada");
    return res.status(200).json({ message: "Sesión cerrada" });
  });
};

exports.register = register;
exports.login = login;
exports.verifyToken = verifyToken;
exports.getUser = getUser;
exports.logOut = logOut;
// exports.refreshToken = refreshToken;
