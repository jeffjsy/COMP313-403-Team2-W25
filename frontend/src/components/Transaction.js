import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import "./Transaction.css";
import api from '../axiosConfig'
const API_URL = process.env.REACT_APP_API_URL;


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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");


    const TRANSACTIONS_URL = `${API_URL}/api/transactions`;
    const CATEGORIES_URL = `${API_URL}/api/categories`;

    const fetchCategories = useCallback(async () => {
        const controller = new AbortController();

        try {
            const res = await axios.get(CATEGORIES_URL, {
                headers: { Authorization: `Bearer ${token}` },
                signal: controller.signal
            });
            setCategories(res.data);
        } catch (error) {
            if (!axios.isCancel(error)) {
                console.error("Error fetching categories:", error);
                toast.error("Failed to fetch categories.");
            }
        }

        return controller;
    }, [token]);

    const fetchTransactions = useCallback(async () => {
        try {
            const res = await axios.get(TRANSACTIONS_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(res.data);
        } catch (err) {
            console.error("Error fetching transactions", err);
            toast.error("Failed to fetch transactions.");
        }
    }, [token, TRANSACTIONS_URL]);

    useEffect(() => {
        if (!token || !user) {
            navigate('/login');
            return;
        }

        const txController = new AbortController();
        const fetchTx = async () => {
            try {
                const res = await axios.get(TRANSACTIONS_URL, {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: txController.signal
                });
                setTransactions(res.data);
            } catch (err) {
                if (!axios.isCancel(err)) {
                    console.error("Error fetching transactions", err);
                    toast.error("Failed to fetch transactions.");
                }
            }
        };

        fetchTx();

        const categoryController = fetchCategories();

        return () => {
            txController.abort();
            categoryController.then(controller => controller.abort());
        };
    }, [token, user, navigate, fetchCategories]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!transactionType || !selectedCategory) {
            alert("Please select a transaction type and category.");
            return;
        }

        // Validate amount
        if (parseFloat(amount) <= 0.0) {
            alert("Amount must be greater than 0.0.");
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

            alert("Transaction added!");
            setTransactionType("");
            setTransactionName("");
            setSelectedCategory("");
            setAmount("");
            setTransactionDate("");
            setRecurring(false);
            fetchTransactions(); // Refresh the transaction list
        } catch (err) {
            console.error("Error adding transaction:", err);
            alert("Failed to add transaction.");
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName) {
            alert("Please enter a category name.");
            return;
        }

        try {
            const res = await axios.post(
                CATEGORIES_URL,
                { name: newCategoryName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Category added successfully!");
            setNewCategoryName("");
            setIsModalOpen(false);
            fetchCategories();
        } catch (err) {
            console.error("Error adding category:", err);
            alert("Failed to add category.");
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
                        <div className="category-select-container">
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
                            <button
                                type="button"
                                className="add-category-button"
                                onClick={() => setIsModalOpen(true)}
                            >
                                +
                            </button>
                        </div>
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

            <section>
                {/* Modal for adding a new category */}
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