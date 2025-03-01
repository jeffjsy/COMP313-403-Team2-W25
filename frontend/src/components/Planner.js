import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import "./Planner.css";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const Planner = () => {
    const [goals, setGoals] = useState([]);
    const [title, setTitle] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [deadline, setDeadline] = useState("");
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("token");
    const inputRefs = useRef({});

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://localhost:5000/api/goals", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGoals(res.data);
        } catch (err) {
            console.error("Error fetching goals:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddGoal = async (e) => {
        e.preventDefault();

        if (!title || !targetAmount || !deadline) {
            alert("Please fill all fields!");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            alert("You must be logged in to add goals.");
            return;
        }

        try {
            const res = await axios.post(
                "http://localhost:5000/api/goals/add",
                { title, targetAmount, deadline },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Goal added successfully!");
            setGoals([...goals, res.data]);
            setTitle("");
            setTargetAmount("");
            setDeadline("");
        } catch (err) {
            console.error("Error adding goal:", err.response ? err.response.data : err.message);
            alert("Failed to add goal. Please check your login status.");
        }
    };

    const handleDeleteGoal = async (goalId) => {
        if (!window.confirm("Are you sure you want to delete this goal?")) return;

        try {
            await axios.delete(`http://localhost:5000/api/goals/delete/${goalId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setGoals(goals.filter((goal) => goal._id !== goalId));
        } catch (err) {
            console.error("Error deleting goal:", err.response ? err.response.data : err.message);
            alert("Failed to delete goal.");
        }
    };

    const handleUpdateProgress = async (goalId) => {
        const inputValue = inputRefs.current[goalId]?.value;

        if (!inputValue || isNaN(inputValue) || Number(inputValue) <= 0) {
            alert("Please enter a valid amount to add.");
            return;
        }

        const incrementAmount = Number(inputValue);

        try {
            const goal = goals.find((g) => g._id === goalId);
            if (!goal) return;

            const newAmount = goal.currentAmount + incrementAmount;

            const res = await axios.put(
                `http://localhost:5000/api/goals/update/${goalId}`,
                { currentAmount: newAmount },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setGoals(goals.map((g) => (g._id === goalId ? res.data : g)));
            inputRefs.current[goalId].value = "";

            if (newAmount >= goal.targetAmount) {
                toast.success(`🎉 Goal "${goal.title}" completed!`, { position: "top-center" });
            }

        } catch (err) {
            console.error("Error updating progress:", err);
            alert("Failed to update goal progress.");
        }
    };


    return (
        <div className="planner-container">
            <h2>Budget Planner & Goal Tracker</h2>

            {/* Add Goal Form */}
            <form onSubmit={handleAddGoal} className="goal-form">
                <input
                    type="text"
                    placeholder="Goal Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Target Amount ($)"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    required
                />
                <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    required
                />
                <button type="submit">Add Goal</button>
            </form>

            {/* Display Goals */}
            {loading ? <p>Loading goals...</p> : (
                <ul className="goal-list">
                    {goals.map((goal) => {
                        const progress = (goal.currentAmount / goal.targetAmount) * 100;
                        return (
                            <li key={goal._id} className="goal-item">
                                <div>
                                    <strong>{goal.title}</strong> - ${goal.currentAmount} / ${goal.targetAmount}
                                    <span> ({goal.status})</span>

                                    {/* Progress Bar */}
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>

                                <input
                                    type="number"
                                    placeholder="Enter Amount"
                                    ref={(el) => (inputRefs.current[goal._id] = el)}
                                />

                                <button
                                    onClick={() => {
                                        handleUpdateProgress(goal._id)
                                    }}
                                    disabled={goal.status === "Completed"}
                                    className="increment-button"
                                >
                                    ➕ Add
                                </button>

                                {/* Delete Button */}
                                <button onClick={() => handleDeleteGoal(goal._id)} className="delete-button">❌</button>
                            </li>
                        );
                    })}
                </ul>

            )}
        </div>
    );
};

export default Planner;
