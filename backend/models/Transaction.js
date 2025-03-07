const mongoose = require('mongoose');
const TransactionType = require("../enums/TransactionType");

const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: Object.values(TransactionType), required: true },
    name: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    amount: { type: mongoose.Types.Decimal128, required: true },
    date: { type: Date, default: new Date(), required: true },
    recurring: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);