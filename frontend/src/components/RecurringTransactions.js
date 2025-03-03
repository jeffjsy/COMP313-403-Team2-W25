import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./RecurringTransactions.css";

const RecurringTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [recurrence, setRecurrence] = useState("monthly");
    const [nextOccurrence, setNextOccurrence] = useState("");
    const token = localStorage.getItem("token");

    // 🔹 Fetch Recurring Transactions
    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/recurring-transactions", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTransactions(res.data);
        } catch (err) {
            console.error("Error fetching transactions:", err);
            toast.error("Failed to fetch recurring transactions.");
        }
    };

    // 🔹 Add a New Recurring Transaction
    const handleAddTransaction = async () => {
        if (!amount || !category || !nextOccurrence) {
            toast.warn("Please fill all fields!");
            return;
        }
        try {
            const res = await axios.post(
                "http://localhost:5000/api/recurring-transactions",
                { amount: parseFloat(amount), category, recurrence, nextOccurrence },
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

    // 🔹 Delete a Recurring Transaction
    const handleDeleteTransaction = async (id) => {
        if (!window.confirm("Delete this recurring transaction?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/recurring-transactions/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTransactions(transactions.filter((t) => t._id !== id));
            toast.success("Recurring transaction deleted!");
        } catch (err) {
            toast.error("Failed to delete recurring transaction.");
        }
    };

    return (
        <div className="recurring-transactions-container">
            <h2>Manage Recurring Transactions</h2>

            {/* 🔹 Form to Add Recurring Transaction */}
            <div className="add-transaction">
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                />
                <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-Weekly</option>
                    <option value="monthly">Monthly</option>
                </select>
                <input
                    type="date"
                    value={nextOccurrence}
                    onChange={(e) => setNextOccurrence(e.target.value)}
                />
                <button onClick={handleAddTransaction}>Add Recurring Transaction</button>
            </div>

            {/* 🔹 Display Recurring Transactions */}
            <ul className="transaction-list">
                {transactions.map((t) => (
                    <li key={t._id}>
                        {t.category} - ${t.amount} ({t.recurrence}) | Next: {new Date(t.nextOccurrence).toLocaleDateString()}
                        <button onClick={() => handleDeleteTransaction(t._id)} className="delete-button">
                            ❌ Cancel
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RecurringTransactions;
