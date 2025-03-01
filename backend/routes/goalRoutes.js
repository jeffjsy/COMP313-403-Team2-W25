const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Goal = require("../models/Goal");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user.id });
        res.json(goals);
    } catch (err) {
        console.error("Error fetching goals:", err);
        res.status(500).json({ msg: "Failed to fetch goals" });
    }
});

router.post("/add", authMiddleware, async (req, res) => {
    const { title, targetAmount, deadline } = req.body;
    if (!title || !targetAmount || !deadline) {
        return res.status(400).json({ msg: "All fields are required" });
    }

    try {
        const newGoal = new Goal({
            userId: req.user.id,
            title,
            targetAmount,
            deadline,
            currentAmount: 0
        });
        await newGoal.save();
        res.json(newGoal);
    } catch (err) {
        console.error("Error adding goal:", err);
        res.status(500).json({ msg: "Failed to add goal" });
    }
});


router.put("/update/:id/add", authMiddleware, async (req, res) => {
    const { amount } = req.body;
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal) return res.status(404).json({ msg: "Goal not found" });

        goal.currentAmount += parseFloat(amount);
        if (goal.currentAmount >= goal.targetAmount) {
            goal.status = "Completed";
        }
        await goal.save();
        res.json(goal);
    } catch (err) {
        console.error("Error adding amount to goal:", err);
        res.status(500).json({ msg: "Server error" });
    }
});


router.put("/update/:id/subtract", authMiddleware, async (req, res) => {
    const { amount } = req.body;
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal) return res.status(404).json({ msg: "Goal not found" });

        goal.currentAmount = Math.max(0, goal.currentAmount - parseFloat(amount));
        await goal.save();
        res.json(goal);
    } catch (err) {
        console.error("Error subtracting amount from goal:", err);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
