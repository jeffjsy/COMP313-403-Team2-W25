const cron = require("node-cron");
const RecurringTransaction = require("../models/RecurringTransaction");
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const Category = require("../models/Category");

// Schedule job to run every minute for testing
//cron.schedule("*/1 * * * *", async () => { 

// Schedule job to run every day at midnight
cron.schedule(" 0 0 * * *", async () => {
    console.log("Running Cron Job: Checking for recurring transactions...");

    try { 
        await mongoose.connect(process.env.MONGO_URI);
        const today = new Date();

        const transactions = await RecurringTransaction.find({
            status: "active",
            nextOccurrence: { $lte: today }
        });

        for (let transaction of transactions) {
            let newDate = new Date(transaction.nextOccurrence);
            if (isNaN(newDate.getTime())) {
                console.log(`Invalid date for transaction ${transaction._id}: ${transaction.nextOccurrence}`);
                continue; // Skip this transaction
            }

            console.log(`Processing transaction: ${transaction.category}, Amount: $${transaction.amount}`);

            try {
                // Check if the category is a valid ObjectId
                if (!mongoose.Types.ObjectId.isValid(transaction.category)) {
                    console.log(`Invalid category ID for transaction ${transaction._id}: ${transaction.category}`);
                    continue; // Skip this transaction
                }

                // Fetch the category to get its name
                const category = await Category.findById(transaction.category);
                if (!category) {
                    console.log(`Category not found for transaction ${transaction._id}: ${transaction.category}`);
                    continue; // Skip this transaction
                }

                // Create a new transaction record
                const newTransaction = new Transaction({
                    userId: transaction.userId,
                    type: "expense",
                    name: `${category.name} (Recurring)`,
                    categoryId: transaction.category,
                    amount: transaction.amount,
                    date: newDate,
                    recurring: true
                });

                await newTransaction.save();
                console.log(`Created transaction: ${newTransaction._id}, Category: ${category.name}, Amount: $${transaction.amount} on ${newDate}`);

                // Update nextOccurance date
                if (transaction.recurrence === "daily") newDate.setDate(newDate.getDate() + 1);
                if (transaction.recurrence === "weekly") newDate.setDate(newDate.getDate() + 7);
                if (transaction.recurrence === "bi-weekly") newDate.setDate(newDate.getDate() + 14);
                if (transaction.recurrence === "monthly") newDate.setMonth(newDate.getMonth() + 1);

                await RecurringTransaction.findByIdAndUpdate(transaction._id, { nextOccurrence: newDate });
            } catch (err) {
                console.error(`Error processing transaction ${transaction._id}:`, err);
                continue; // Skip to next transaction
            }
        }
        console.log("Cron Job Completed.");
    } catch (error) {
        console.error("Error running cron job:", error);
    }
});