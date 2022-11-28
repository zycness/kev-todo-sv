const Task = require("../models/Task");
const User = require("../models/User");
ObjectId = require("mongodb").ObjectID;

const getTasks = async (req, res) => {
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

  try {
    const tasks = await Task.find({ createdBy: ObjectId(userId) });

    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(404).json({
      message: "Hubo un error al buscar las tareas.",
      error: error.message,
    });
  }
};

const editTask = async (req, res) => {
  const userId = req.id;
  const taskUpdate = req.body.taskData;
  const taskId = ObjectId(req.params.id);

  let user;
  try {
    user = await User.findById(userId, "-password");
  } catch (error) {
    return new Error(error);
  }
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  try {
    const task = await Task.findById(taskId);
    if (!task)
      return res.status(404).json({ message: "La tarea no fue encontrada." });
    let query = { $set: {} };
    for (let key in taskUpdate) {
      if (task[key] != taskUpdate[key]) {
        query.$set[key] = taskUpdate[key];
      }
    }

    try {
      await Task.updateOne({ _id: taskId }, query, { $set: { isAdmin: true } });

      return res.status(200).json({
        message: "Se ha actualizado la tarea correctamente: " + task,
      });
    } catch (error) {
      return res
        .status(400)
        .json({ message: "No se ha podido actualizar la tarea:" + error });
    }
  } catch (error) {
    return res
      .status(400)
      .json({ message: "No se ha podido actualizar la tarea" + error });
  }
};

const createTask = async (req, res) => {
  const { name, desc, completed } = req.body.newTask;

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

  const newTask = new Task({
    name,
    desc,
    completed,
    createdBy: user._id,
    createdAt: Date.now(),
  });

  try {
    await newTask.save().then(() => {
      return res.status(201).json({ message: "Nuevo producto creado: " });
    });
  } catch (error) {
    return res.status(400).json({
      message:
        "No se ha podido crear la tarea en la base de datos: " + error.message,
    });
  }
};

const deleteTask = async (req, res) => {
  const userId = req.id;
  const taskId = req.body.taskId;
  const objId = ObjectId(taskId);

  let user;
  try {
    user = await User.findById(userId, "-password");
  } catch (error) {
    return new Error(error);
  }
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  try {
    const taskToDelete = await Task.findById(objId);
    const res = await Task.deleteOne({ _id: taskToDelete._id });
    console.log("Task/s eliminado/s: " + res.deletedCount);
    return res
      .status(200)
      .json({ message: "Se pudo eliminar la tarea correctamente" });
  } catch (err) {
    return res.status(400).json({
      message: "No fue posible eliminar la tarea, inténtelo nuevamente",
      error: err,
    });
  }
};

exports.createTask = createTask;
exports.deleteTask = deleteTask;
exports.getTasks = getTasks;
exports.editTask = editTask;
