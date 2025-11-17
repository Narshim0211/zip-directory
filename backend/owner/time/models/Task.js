const mongoose = require("mongoose");
const { createTimeTaskSchema } = require("../../../shared/timeTaskSchema");

const ownerTimeTaskSchema = createTimeTaskSchema();

module.exports = mongoose.model("OwnerTimeTask", ownerTimeTaskSchema, "owner_time_tasks");
