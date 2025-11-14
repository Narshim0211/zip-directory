const mongoose = require("mongoose");
const { createTimeTaskSchema } = require("../../../shared/timeTaskSchema");

const taskSchema = createTimeTaskSchema();

module.exports = mongoose.model("VisitorTimeTask", taskSchema, "visitor_time_tasks");
