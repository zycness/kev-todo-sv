const express = require("express");
const {
  register,
  login,
  verifyToken,
  getUser,
  logOut,
} = require("../controllers/userControllers");
const {
  createTask,
  deleteTask,
  getTasks,
  editTask,
} = require("../controllers/taskControllers");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/user", verifyToken, getUser);
router.post("/logout", verifyToken, logOut);

router.post("/task", verifyToken, createTask);
router.post("/task/delete/:id", verifyToken, deleteTask);
router.get("/tasks", verifyToken, getTasks);
router.post("/task/:id", verifyToken, editTask);

module.exports = router;
