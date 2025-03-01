import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
import "./Goals.css";

Modal.setAppElement("#root");

const Goals = () => {
    const [goals, setGoals] = useState([]);
    const [title, setTitle] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [currentAmount, setCurrentAmount] = useState("");
    const [deadline, setDeadline] = useState("");
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/goals", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGoals(res.data);
        } catch (err) {
            console.error("Error fetching goals:", err);
            toast.error("Failed to fetch goals!");
        }
    };

    const handleAddGoal = async () => {
        if (!title || !targetAmount || !deadline) {
            toast.warn("Please fill all fields!");
            return;
        }
        try {
            const res = await axios.post(
                "http://localhost:5000/api/goals/add",
                {
                    title,
                    targetAmount: parseFloat(targetAmount),
                    currentAmount: parseFloat(currentAmount) || 0,
                    deadline,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setGoals([...goals, res.data]);
            setTitle("");
            setTargetAmount("");
            setCurrentAmount("");
            setDeadline("");
            setModalIsOpen(false);
            toast.success("Goal added successfully!");
        } catch (err) {
            console.error("Error creating goal:", err.response ? err.response.data : err.message);
            toast.error("Failed to create goal.");
        }
    };
    const handleDeleteGoal = async (id) => {
        if (!window.confirm("Delete this goal?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/goals/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGoals(goals.filter((goal) => goal._id !== id));
            toast.success("Goal deleted!");
        } catch (err) {
            toast.error("Failed to delete goal.");
        }
    };

    const handleAmountChange = async (id, amount, action) => {
        try {
            const url = `http://localhost:5000/api/goals/update/${id}/${action}`;
            const res = await axios.put(
                url,
                { amount: parseFloat(amount) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setGoals(goals.map(g => g._id === id ? res.data : g));
            toast.success(`Amount ${action === 'add' ? 'added' : 'subtracted'} successfully!`);
        } catch (err) {
            console.error("Error updating goal amount:", err);
            toast.error("Failed to update goal amount.");
        }
    };

    return (
        <div className="goals-container">
            <h2>Manage Your Goals</h2>
            <button onClick={() => setModalIsOpen(true)} className="add-goal-button">
                Add New Goal
            </button>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                className="goal-modal"
                overlayClassName="goal-modal-overlay"
            >
                <h3>Add New Goal</h3>
                <input
                    type="text"
                    placeholder="Goal Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Target Amount ($)"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                />
                <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                />
                <button onClick={handleAddGoal} className="add-goal-category-button">
                    Add Goal
                </button>
                <button onClick={() => setModalIsOpen(false)} className="close-button">
                    Close
                </button>
            </Modal>

            <div className="goal-list">
                {goals.map((goal) => {
                    const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                    const status = progress >= 100 ? "Completed" : "In Progress";
                    return (
                        <div key={goal._id} className="goal-item">
                            <div className="goal-header">
                                <h4>{goal.title}</h4>
                                <p>{status}</p>
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${progress}%`,
                                        backgroundColor: progress >= 100 ? "#f44336" : "#4CAF50",
                                    }}
                                />
                            </div>
                            <p>${goal.currentAmount} / ${goal.targetAmount}</p>
                            <input
                                type="number"
                                placeholder="Enter Amount"
                                min="1"
                                onChange={(e) => setCurrentAmount(e.target.value)}
                            />
                            <button onClick={() => handleAmountChange(goal._id, currentAmount, 'add')}>
                                ➕ Add
                            </button>
                            <button onClick={() => handleAmountChange(goal._id, currentAmount, 'subtract')}>
                                ➖ Subtract
                            </button>
                            <button onClick={() => handleDeleteGoal(goal._id)}>
                                ❌ Delete
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Goals;
