const mongoose = require("mongoose");
const TransactionType = require("../enums/TransactionType");

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true }
});

module.exports = mongoose.model("Category", CategorySchema);