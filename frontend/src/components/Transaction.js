import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import "./Transaction.css";

const Transactions = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const [transactions, setTransactions] = useState([]);
    const [transactionType, setTransactionType] = useState("");
    const [transactionName, setTransactionName] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [amount, setAmount] = useState("");
    const [transactionDate, setTransactionDate] = useState("");
    const [recurring, setRecurring] = useState(false);

    const TRANSACTIONS_URL = "http://localhost:5000/api/transactions";
    const CATEGORIES_URL = "http://localhost:5000/api/categories";

    const fetchTransactions = useCallback(async () => {
        try {
            const res = await axios.get(TRANSACTIONS_URL, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTransactions(res.data);
        } catch (err) {
            console.error("Error fetching transactions", err);
            toast.error("Failed to fetch transactions.");
        }
    }, [token]);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await axios.get(CATEGORIES_URL, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories(res.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Failed to fetch categories.");
        }
    }, [token]);

    useEffect(() => {
        if (!token || !user) {
            navigate('/login');
            return;
        }
        fetchTransactions();
        fetchCategories();
    }, [token, user, navigate, fetchTransactions, fetchCategories]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!transactionType || !selectedCategory) {
            toast.error("Please select a transaction type and category.");
            return;
        }

        try {
            await axios.post(
                TRANSACTIONS_URL,
                {
                    userId: user._id,
                    type: transactionType,
                    name: transactionName,
                    categoryId: selectedCategory,
                    amount: parseFloat(amount),
                    date: transactionDate || new Date(),
                    recurring,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Transaction added!");
            setTransactionType("");
            setTransactionName("");
            setSelectedCategory("");
            setAmount("");
            setTransactionDate("");
            setRecurring(false);
            fetchTransactions(); // Refresh the transaction list
        } catch (err) {
            console.error("Error adding transaction:", err);
            toast.error("Failed to add transaction.");
        }
    };

    return (
        <div className="transactions-container">
            <section className="form-section">
                <h2>Add New Transaction</h2>
                <form onSubmit={handleSubmit} className="transaction-form">
                    <label>
                        Type:
                        <select
                            value={transactionType}
                            onChange={(e) => setTransactionType(e.target.value)}
                            required
                        >
                            <option value="">Select Type</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </label>

                    <label>
                        Name:
                        <input
                            type="text"
                            value={transactionName}
                            onChange={(e) => setTransactionName(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Category:
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Amount:
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Date:
                        <input
                            type="date"
                            value={transactionDate}
                            onChange={(e) => setTransactionDate(e.target.value)}
                        />
                    </label>

                    <button type="submit" className="submit-button">
                        Add Transaction
                    </button>
                </form>
            </section>

            <section className="list-section">
                <h2>Transaction List</h2>
                <ul className="transaction-list">
                    {transactions.map((t) => (
                        <li key={t._id} className="transaction-item">
                            <div className="transaction-info">
                                <span className={`transaction-type ${t.type === "income" ? "income" : "expense"}`}>
                                    {t.type}
                                </span>
                                <span className="transaction-name">{t.name}</span>
                                <span className="transaction-amount">${t.amount}</span>
                                <span className="transaction-date">
                                    {new Date(t.date).toISOString().split("T")[0]}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
};

export default Transactions;