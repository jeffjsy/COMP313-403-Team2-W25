const cron = require("node-cron");
const RecurringTransaction = require("../models/RecurringTransaction");
const mongoose = require("mongoose");

// Schedule job to run every minute for testing
cron.schedule("*/1 * * * *", async () => { 

// Schedule job to run every day at midnight
//cron.schedule(" 0 0 * * *", async () => {
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

            if (transaction.recurrence === "daily") newDate.setDate(newDate.getDate() + 1);
            if (transaction.recurrence === "weekly") newDate.setDate(newDate.getDate() + 7);
            if (transaction.recurrence === "bi-weekly") newDate.setDate(newDate.getDate() + 14);
            if (transaction.recurrence === "monthly") newDate.setMonth(newDate.getMonth() + 1);

            await RecurringTransaction.findByIdAndUpdate(transaction._id, { nextOccurrence: newDate });
        }
        console.log("Cron Job Completed.");
    } catch (error) {
        console.error("Error running cron job:", error);
    }
});