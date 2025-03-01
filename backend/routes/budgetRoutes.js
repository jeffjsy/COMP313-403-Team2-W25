const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Budget = require("../models/Budget");

const router = express.Router();

// 🟢 Create a new budget (POST /api/budgets/add)
router.post("/add", authMiddleware, async (req, res) => {
    const { category, targetAmount, currentAmount = 0 } = req.body;
    console.log("Received data:", req.body);  // 🟢 Log incoming data

    if (!category || !targetAmount) {
        return res.status(400).json({ msg: "Category and target amount are required" });
    }

    try {
        const newBudget = new Budget({
            userId: req.user.id,
            category,
            targetAmount: parseFloat(targetAmount),
            currentAmount: parseFloat(currentAmount)
        });
        await newBudget.save();
        console.log("Budget created:", newBudget);  // 🟢 Log success
        res.json(newBudget);
    } catch (err) {
        console.error("Error creating budget:", err);
        res.status(500).json({ msg: "Failed to create budget" });
    }
});


// 🟢 Get all budgets (GET /api/budgets)
router.get("/", authMiddleware, async (req, res) => {
    try {
        const budgets = await Budget.find({ userId: req.user.id });
        res.json(budgets);
    } catch (err) {
        console.error("Error fetching budgets:", err);
        res.status(500).json({ msg: "Failed to fetch budgets" });
    }
});

// 🟢 Add amount to a budget
router.put("/update/:id/add", authMiddleware, async (req, res) => {
    const { amount } = req.body;
    try {
        const budget = await Budget.findById(req.params.id);
        if (!budget) return res.status(404).json({ msg: "Budget not found" });

        budget.currentAmount += parseFloat(amount);
        await budget.save();
        res.json(budget);
    } catch (err) {
        console.error("Error adding amount to budget:", err);
        res.status(500).json({ msg: "Server error" });
    }
});

// 🟢 Subtract amount from a budget
router.put("/update/:id/subtract", authMiddleware, async (req, res) => {
    const { amount } = req.body;
    try {
        const budget = await Budget.findById(req.params.id);
        if (!budget) return res.status(404).json({ msg: "Budget not found" });

        budget.currentAmount = Math.max(0, budget.currentAmount - parseFloat(amount));
        await budget.save();
        res.json(budget);
    } catch (err) {
        console.error("Error subtracting amount from budget:", err);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
