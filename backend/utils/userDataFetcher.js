const Transaction = require('../models/Transaction');
const Goals = require('../models/Goal');

exports.getUserTransactions = async (userId) => {
    return Transaction.find({userId});
}

exports.getUserGoals = async (userId) => {
    return Goals.find({userId});
}