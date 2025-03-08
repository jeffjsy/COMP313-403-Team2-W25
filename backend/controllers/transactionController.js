const Transaction = require('../models/Transaction');

// Get all transactions
const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find();
        // Convert the amount to a readable number
        const transactionsWithAmount = transactions.map(transaction => ({
            ...transaction.toObject(),
            amount: transaction.amount.toString()
        }));
        res.status(200).json(transactionsWithAmount);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get transaction by id
const getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) { return res.status(404).json({ error: "Transaction not found" }) };

        // Convert amount to a readable format
        const transactionWithAmount = {
            ...transaction.toObject(),
            amount: transaction.amount.toString()
        };
        res.status(200).json(transactionWithAmount);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new transaction
const createTransaction = async (req, res) => {
    try {
        const newTransaction = new Transaction(req.body);
        await newTransaction.save();
        // Convert the amount to a readable format before sending the response
        const transactionResponse = {
            ...newTransaction.toObject(),
            amount: newTransaction.amount.toString()
        };
        res.status(201).json(transactionResponse);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update transaction
const updateTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!transaction) { return res.status(404).json({ error: "Transaction not found" }); }

        // Convert amount to a readable format before sending the response
        const transactionResponse = {
            ...transaction.toObject(),
            amount: transaction.amount.toString()
        };
        res.status(200).json(transactionResponse);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findByIdAndDelete(req.params.id);
        if (!transaction) return res.status(404).json({ error: "Transaction not found" });
        res.json({ message: "Transaction deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
};
