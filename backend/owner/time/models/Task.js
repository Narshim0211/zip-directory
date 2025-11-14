const mongoose = require("mongoose");
const { createTimeTaskSchema } = require("../../../shared/timeTaskSchema");

const taskSchema = createTimeTaskSchema();

module.exports = mongoose.model("OwnerTimeTask", taskSchema, "owner_time_tasks");
