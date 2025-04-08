const mongoose = require('mongoose');

const RecurringTransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    amount: { type: Number, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    recurrence: { type: String, enum: ['daily', 'weekly', 'bi-weekly', 'monthly'], required: true},
    nextOccurrence: { type: Date, required: true },
    status: { type: String, enum: ["active", "cancelled"], default: "active" }
}, { timestamps: true });

module.exports = mongoose.model('RecurringTransaction', RecurringTransactionSchema);