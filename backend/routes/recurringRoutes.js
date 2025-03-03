const express = require('express');
const router = express.Router();
const RecurringTransaction = require('../models/RecurringTransaction');
const authMiddleware = require('../middleware/authMiddleware');

// Create recurring transaction
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { amount, category, recurrence, nextOccurrence } = req.body;
        const newTransaction = new RecurringTransaction({
            userId: req.user.id,
            amount, 
            category,
            recurrence,
            nextOccurrence
        });
        await newTransaction.save();
        res.status(201).json(newTransaction);
    } catch (error) {
        res.status(500).json({ error: "Error creating recurring transaction." });
    }
});

// Get all recurring transactions
router.get("/", authMiddleware, async (req, res) => {
    try {
        const transactions = await RecurringTransaction.find({ userId: req.user.id, status: "active" });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: "Error fetching transactions." });
    }
});

// Update recurring transaction
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { amount, category, recurrence, nextOccurrence } = req.body;
        const transaction = await RecurringTransaction.findByIdAndUpdate( req.params.id, {amount, category, recurrence, nextOccurrence}, {new: true});
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: "Error updating transaction." });
    }
});

// Delete recurring transaction
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        await RecurringTransaction.findByIdAndUpdate(req.params.id, { status: "canceled" });
        res.json({ message: "Recurring transaction canceled." });
    } catch (error) {
        res.status(500).json({ error: "Error deleting transaction." });
    }
});

module.exports = router;