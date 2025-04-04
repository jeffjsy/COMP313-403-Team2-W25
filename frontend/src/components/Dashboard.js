// src/components/Dashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Dashboard.css";

// Import chart components and necessary chart elements
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [transactions, setTransactions] = useState([]);
  const [recTransactions, setRecTransactions] = useState([]);

  // API endpoints
  const TRANSACTIONS_URL = "http://localhost:5000/api/transactions";
  const RECURRING_URL = "http://localhost:5000/api/recurring-transactions";

  useEffect(() => {
    if (!token || !user) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [transactionsRes, recTransactionsRes] = await Promise.all([
          axios.get(TRANSACTIONS_URL, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(RECURRING_URL, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setTransactions(transactionsRes.data);
        setRecTransactions(recTransactionsRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
        toast.error("Failed to load dashboard data.");
      }
    };

    fetchData();
  }, [token, user, navigate]);

  // ----------------------------
  // Chart 1: Income vs Expense Pie Chart
  // ----------------------------
  const incomeCount = transactions.filter((t) => t.type === "income").length;
  const expenseCount = transactions.filter((t) => t.type === "expense").length;

  const pieData = {
    labels: ["Income", "Expense"],
    datasets: [
      {
        data: [incomeCount, expenseCount],
        backgroundColor: ["#4caf50", "#f44336"],
      },
    ],
  };

  // ----------------------------
  // Chart 2: Bar Chart for Monthly Totals (Regular Transactions)
  // ----------------------------
  const monthlyTotals = {};
  transactions.forEach((t) => {
    const date = new Date(t.date);
    const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;
    monthlyTotals[monthYear] = (monthlyTotals[monthYear] || 0) + parseFloat(t.amount);
  });
  const barLabels = Object.keys(monthlyTotals).sort((a, b) => {
    const [am, ay] = a.split("-").map(Number);
    const [bm, by] = b.split("-").map(Number);
    return new Date(ay, am - 1) - new Date(by, bm - 1);
  });
  const barData = {
    labels: barLabels,
    datasets: [
      {
        label: "Total Amount",
        data: barLabels.map((label) => monthlyTotals[label]),
        backgroundColor: "#2196f3",
      },
    ],
  };

  // ----------------------------
  // Chart 3: Line Chart for Recurring Transactions
  // ----------------------------
  // Here we group recurring transactions by their next occurrence date.
  const recurringTotals = {};
  recTransactions.forEach((rt) => {
    const date = new Date(rt.nextOccurrence).toISOString().split("T")[0];
    recurringTotals[date] = (recurringTotals[date] || 0) + 1;
  });
  const lineLabels = Object.keys(recurringTotals).sort();
  const lineData = {
    labels: lineLabels,
    datasets: [
      {
        label: "Recurring Transactions Count",
        data: lineLabels.map((label) => recurringTotals[label]),
        fill: false,
        borderColor: "#ff9800",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <div className="charts-grid">
        <div className="chart-item">
          <h3>Income vs Expense Distribution</h3>
          <Pie data={pieData} />
        </div>
        <div className="chart-item">
          <h3>Monthly Totals (Regular Transactions)</h3>
          <Bar data={barData} />
        </div>
        <div className="chart-item">
          <h3>Recurring Transactions Over Time</h3>
          <Line data={lineData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
