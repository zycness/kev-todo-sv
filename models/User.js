const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
  },
  role: {
    type: Object,
    required: true,
  },
  tasksCreated: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Task",
  },
});

module.exports = mongoose.model("User", userSchema);
