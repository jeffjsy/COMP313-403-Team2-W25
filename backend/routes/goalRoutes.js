const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Goal = require('../models/Budget');

const router = express.Router();

// Add a new Goal
router.post("/add", authMiddleware, async (req, res) => {
    try {
        const { title, targetAmount, deadline } = req.body;

        if (!title || !targetAmount || !deadline) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        const newGoal = new Goal({
            userId: req.user.id,
            title,
            targetAmount,
            currentAmount: 0,
            deadline,
            status: "in-progress",
        });

        await newGoal.save();
        console.log("Goal saved:", newGoal);
        res.status(201).json(newGoal);
    } catch (err) {
        console.error("Error saving goal:", err.message);
        res.status(500).json({ msg: "Error adding goal", error: err.message });
    }
});

// Get all Goals
router.get('/', authMiddleware, async (req, res) => {
    try{
        const goals = await Goal.find({userId: req.user.id});
        res.json(goals);
    } catch(err){
        res.status(500).json({msg: 'Error fectching goals', error: err.message});
    }
});

router.put("/update/:id", authMiddleware, async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal || goal.userId.toString() !== req.user.id) {
            return res.status(404).json({ msg: "Goal not found" });
        }

        goal.currentAmount = req.body.currentAmount || goal.currentAmount;
        if (goal.currentAmount >= goal.targetAmount) goal.status = "completed";

        await goal.save();
        res.json(goal);
    } catch (err) {
        res.status(500).json({ msg: "Error updating goal", error: err.message });
    }
});

router.delete("/delete/:id", authMiddleware, async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal || goal.userId.toString() !== req.user.id) {
            return res.status(404).json({ msg: "Goal not found" });
        }

        await Goal.findByIdAndDelete(req.params.id);
        res.json({ msg: "Goal deleted successfully" });
    } catch (err) {
        console.error("Error deleting goal:", err.message);
        res.status(500).json({ msg: "Error deleting goal", error: err.message });
    }
});

module.exports = router;