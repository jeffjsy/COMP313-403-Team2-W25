import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
import "./Budget.css";
import api from '../axiosConfig';

Modal.setAppElement("#root");

const Budget = () => {
    const [budgets, setBudgets] = useState([]);
    const [category, setCategory] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [currentAmount, setCurrentAmount] = useState("");
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchBudgets();
    }, []);

    const fetchBudgets = async () => {
        try {
          const res = await api.get("/api/budgets", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setBudgets(res.data);
        } catch (err) {
          console.error("Error fetching budgets:", err);
          toast.error("Failed to fetch budgets!");
        }
      };

      const handleAddBudget = async () => {
        if (!category || !targetAmount) {
            toast.warn("Please fill all fields!");
            return;
        }
        try {
            const res = await api.post(
                "/api/budgets/add",
                {
                    category,
                    targetAmount: parseFloat(targetAmount),
                    currentAmount: parseFloat(currentAmount) || 0
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBudgets([...budgets, res.data]);
            setCategory("");
            setTargetAmount("");
            setCurrentAmount("");
            setModalIsOpen(false);
            toast.success("Budget added successfully!");
        } catch (err) {
            console.error("Error creating budget:", err);
            toast.error("Failed to create budget.");
        }
    };
    
    const handleDeleteBudget = async (id) => {
        if (!window.confirm("Delete this budget?")) return;
        try {
            await api.delete(`/api/budgets/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBudgets(budgets.filter((budget) => budget._id !== id));
            toast.success("Budget deleted!");
        } catch (err) {
            toast.error("Failed to delete budget.");
        }
    };
    
    const handleAmountChange = async (id, amount, action) => {
        try {
            const url = `/api/budgets/update/${id}/${action}`;
            const res = await api.put(
                url,
                { amount: parseFloat(amount) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBudgets(budgets.map(b => b._id === id ? res.data : b));
            toast.success(`Amount ${action === 'add' ? 'added' : 'subtracted'} successfully!`);
        } catch (err) {
            console.error("Error updating budget amount:", err);
            toast.error("Failed to update budget amount.");
        }
    };

    return (
        <div className="budget-container">
            <h2>Manage Your Budget</h2>
            <button onClick={() => setModalIsOpen(true)} className="add-budget-button">
                Add New Budget Category
            </button>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                className="budget-modal"
                overlayClassName="budget-modal-overlay"
            >
                <h3>Add New Budget Category</h3>
                <input
                    type="text"
                    placeholder="Category (e.g., Groceries)"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Target Amount ($)"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Current Amount Spent ($)"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                />
                <button onClick={handleAddBudget} className="add-category-button">
                    Add Category
                </button>
                <button onClick={() => setModalIsOpen(false)} className="close-button">
                    Close
                </button>
            </Modal>

            <div className="budget-list">
                {budgets.map((budget) => {
                    const progress = Math.min((budget.currentAmount / budget.targetAmount) * 100, 100);
                    return (
                        <div key={budget._id} className="budget-item">
                            <div className="budget-header">
                                <h4>{budget.category}</h4>
                                <p>${budget.currentAmount} / ${budget.targetAmount}</p>
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
                            <p>{Math.round(progress)}%</p>

                            {/* Add & Subtract Amount */}
                            <div className="budget-actions">
                                <input
                                    type="number"
                                    placeholder="Enter Amount"
                                    min="1"
                                    onChange={(e) => setCurrentAmount(e.target.value)}
                                />
                                <button
                                    className="add-button"
                                    onClick={() => handleAmountChange(budget._id, currentAmount, 'add')}
                                >
                                    ➕ Add
                                </button>
                                <button
                                    className="subtract-button"
                                    onClick={() => handleAmountChange(budget._id, currentAmount, 'subtract')}
                                >
                                    ➖ Subtract
                                </button>
                                <button
                                    onClick={() => handleDeleteBudget(budget._id)}
                                    className="delete-button"
                                >
                                    ❌ Delete
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Budget;
