import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./RecurringTransactions.css";
const API_URL = process.env.REACT_APP_API_URL;


const RecurringTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [recurrence, setRecurrence] = useState("monthly");
    const [nextOccurrence, setNextOccurrence] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const token = localStorage.getItem("token");

    const fetchTransactions = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/api/recurring-transactions`, {
                headers: { Authorization: `Bearer ${token}`},
            });
            setTransactions(res.data);
        } catch (err) {
            console.error("Error fetching transactions", err);
            toast.error("Failed to fetch recurring transactions.");
        }
    }, [token]);

    // Function to fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/api/categories`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories(res.data);
        } catch (err) {
            console.error("Error fetching categories:", err);
            toast.error("Failed to fetch categories.");
        }
    }, [token]);

    useEffect(() => {
        fetchTransactions();
        fetchCategories();
    }, [fetchTransactions]);

    // Add a New Recurring Transaction
    const handleAddTransaction = async () => {
        if (!amount || !category || !nextOccurrence) {
            toast.warn("Please fill all fields.");
            return;
        }

        const selectedDate = new Date(`${nextOccurrence}T12:00:00Z`);

        try {
            const res = await axios.post(
                `${API_URL}/api/recurring-transactions`,
                { amount: parseFloat(amount), category, recurrence, nextOccurrence: selectedDate.toISOString() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTransactions([...transactions, res.data]);
            setAmount("");
            setCategory("");
            setRecurrence("monthly");
            setNextOccurrence("");
            toast.success("Recurring transaction added!");
        } catch (err) {
            console.error("Error adding transaction:", err);
            toast.error("Failed to add recurring transaction.");
        }
    };

    // Delete a Recurring Transaction
    const handleDeleteTransaction = async (id) => {
        if (!window.confirm("Delete this recurring transaction?")) return;
        try {
            await axios.delete(`${API_URL}/api/recurring-transactions/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTransactions(transactions.filter((t) => t._id !== id));
            toast.success("Recurring transaction deleted!");
        } catch (err) {
            toast.error("Failed to delete recurring transaction.");
        }
    };

    // Open modal to add new category
    const handleAddCategory = async () => {
        if (!newCategoryName) {
            toast.warn("Please enter a category name.");
            return;
        }
    
        try {
            const res = await axios.post(
                `${API_URL}/api/categories`,
                { name: newCategoryName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Category added successfully!");
            setNewCategoryName("");
            setIsModalOpen(false);
            fetchCategories();
        } catch (err) {
            console.error("Error adding category:", err);
            toast.error("Failed to add category.");
        }
    };

    // Gets category name from ID
    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat._id === categoryId);
        return category ? category.name : 'Unknown';
    };

    return (
        <div className="container">
            <h2 className="title">Manage Recurring Transactions</h2>

            <div className="transaction-card">
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input-field"
                />
                <div className="category-select-container">
                    <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)} 
                        className="input-field"
                    >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className="add-category-button"
                        onClick={() => setIsModalOpen(true)}
                    >
                        +
                    </button>
                </div>
                <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)} className="input-field">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-Weekly</option>
                    <option value="monthly">Monthly</option>
                </select>
                <input
                    type="date"
                    value={nextOccurrence}
                    onChange={(e) => setNextOccurrence(e.target.value)}
                    className="input-field"
                />
                <button onClick={handleAddTransaction} className="add-button">Add Recurring Transaction</button>
            </div>

            <ul className="transaction-list">
                {transactions.map((t) => (
                    <li key={t._id} className="transaction-item">
                        <div className="transaction-info">
                            <span className="transaction-category">{getCategoryName(t.category)}</span> - 
                            <span className="transaction-amount">${t.amount}</span>
                            <span className="transaction-recurrence">({t.recurrence})</span>
                            <span className="transaction-date"> | Next: {new Date(t.nextOccurrence).toISOString().split("T")[0]}</span>
                        </div>
                        <button onClick={() => handleDeleteTransaction(t._id)} className="delete-button">❌ Cancel</button>
                    </li>
                ))}
            </ul>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Add New Category</h3>
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Enter category name"
                        />
                        <div className="modal-buttons">
                            <button onClick={handleAddCategory}>Save</button>
                            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecurringTransactions;
