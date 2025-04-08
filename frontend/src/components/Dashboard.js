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
  const [categories, setCategories] = useState([]);
  const [timeFilter, setTimeFilter] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(true);

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
        const [transactionsRes, recTransactionsRes, categoriesRes] = await Promise.all([
          axios.get(TRANSACTIONS_URL, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(RECURRING_URL, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/categories", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setTransactions(transactionsRes.data);
        setRecTransactions(recTransactionsRes.data);
        setCategories(categoriesRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
        toast.error("Failed to load dashboard data.");
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user, navigate]);

  const getFilteredTransactions = () => {
    if (timeFilter === "all") return transactions;
    
    const now = new Date();
    let start = new Date();
    
    if (timeFilter === "week") {
      start.setDate(now.getDate() - 7);
    } else if (timeFilter === "month") {
      start.setMonth(now.getMonth() - 1);
    } else if (timeFilter === "year") {
      start.setFullYear(now.getFullYear() - 1);
    } else if (timeFilter === "custom") {
      if (!startDate || !endDate) return transactions;
      return transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate >= new Date(startDate) && txDate <= new Date(endDate);
      });
    }
    
    return transactions.filter(t => new Date(t.date) >= start);
  };

  const getFilteredRecurringTransactions = () => {
    if (timeFilter === "all") return recTransactions;
    
    const now = new Date();
    let start = new Date();
    
    if (timeFilter === "week") {
      start.setDate(now.getDate() - 7);
    } else if (timeFilter === "month") {
      start.setMonth(now.getMonth() - 1);
    } else if (timeFilter === "year") {
      start.setFullYear(now.getFullYear() - 1);
    } else if (timeFilter === "custom") {
      if (!startDate || !endDate) return recTransactions;
      return recTransactions.filter(t => {
        const txDate = new Date(t.nextOccurrence);
        return txDate >= new Date(startDate) && txDate <= new Date(endDate);
      });
    }
    
    return recTransactions.filter(t => new Date(t.nextOccurrence) >= start);
  };

  // ----------------------------
  // Chart 1: Income vs Expense Pie Chart
  // ----------------------------
  const filteredTransactions = getFilteredTransactions();
  const filteredRecTransactions = getFilteredRecurringTransactions();
  const incomeCount = filteredTransactions.filter((t) => t.type === "income").length;
  const expenseCount = filteredTransactions.filter((t) => t.type === "expense").length;

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
  filteredTransactions.forEach((t) => {
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
  filteredRecTransactions.forEach((rt) => {
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

  // ----------------------------
  // Chart 4: Spending by Category Pie Chart
  // ----------------------------
  const categorySpending = {};
  filteredTransactions.filter(t => t.type === "expense").forEach((t) => {
    const categoryId = t.categoryId;
    const category = categories.find(c => c._id === categoryId);
    const categoryName = category ? category.name : "Uncategorized";
    
    categorySpending[categoryName] = (categorySpending[categoryName] || 0) + parseFloat(t.amount);
  });

  const categoryLabels = Object.keys(categorySpending);
  const categoryData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryLabels.map((label) => categorySpending[label]),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8AC926', '#1982C4', '#6A4C93', '#F94144'],
      },
    ],
  };

  // ----------------------------
  // Chart 5: Monthly Income vs Expense Comparison
  // ----------------------------
  const monthlyComparison = {};
  filteredTransactions.forEach(t => {
    const date = new Date(t.date);
    const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;
    
    if (!monthlyComparison[monthYear]) {
      monthlyComparison[monthYear] = { income: 0, expense: 0 };
    }
    
    if (t.type === "income") {
      monthlyComparison[monthYear].income += parseFloat(t.amount);
    } else {
      monthlyComparison[monthYear].expense += parseFloat(t.amount);
    }
  });

  const comparisonLabels = Object.keys(monthlyComparison).sort();
  const comparisonData = {
    labels: comparisonLabels,
    datasets: [
      {
        label: 'Income',
        data: comparisonLabels.map(label => monthlyComparison[label].income),
        backgroundColor: '#4caf50',
        borderColor: '#388e3c',
        borderWidth: 1,
      },
      {
        label: 'Expenses',
        data: comparisonLabels.map(label => monthlyComparison[label].expense),
        backgroundColor: '#f44336',
        borderColor: '#c62828',
        borderWidth: 1,
      }
    ]
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Financial Dashboard</h2>
        <div className="filter-wrapper">
          <div className="filter-controls">
            <div className="time-filter-tabs">
              <button 
                className={`filter-tab ${timeFilter === 'week' ? 'active' : ''}`}
                onClick={() => setTimeFilter('week')}
              >
                Week
              </button>
              <button 
                className={`filter-tab ${timeFilter === 'month' ? 'active' : ''}`}
                onClick={() => setTimeFilter('month')}
              >
                Month
              </button>
              <button 
                className={`filter-tab ${timeFilter === 'year' ? 'active' : ''}`}
                onClick={() => setTimeFilter('year')}
              >
                Year
              </button>
              <button 
                className={`filter-tab ${timeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setTimeFilter('all')}
              >
                All Time
              </button>
              <button 
                className={`filter-tab ${timeFilter === 'custom' ? 'active' : ''}`}
                onClick={() => setTimeFilter('custom')}
              >
                Custom
              </button>
            </div>
            
            {timeFilter === "custom" && (
              <div className="date-range">
                <div className="date-input-group">
                  <label>From</label>
                  <input 
                    type="date" 
                    value={startDate || ''} 
                    onChange={(e) => setStartDate(e.target.value)}
                    className="date-input"
                  />
                </div>
                <div className="date-input-group">
                  <label>To</label>
                  <input 
                    type="date" 
                    value={endDate || ''} 
                    onChange={(e) => setEndDate(e.target.value)}
                    className="date-input" 
                  />
                </div>
                <button className="apply-date-button" onClick={() => toast.success("Date range applied")}>
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="financial-summary">
        <div className="summary-card income">
          <div className="summary-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" fill="#4caf50"/>
            </svg>
          </div>
          <div className="summary-content">
            <h4>Total Income</h4>
            <p className="amount income-amount">
              ${filteredTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + parseFloat(t.amount), 0).toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="summary-card expense">
          <div className="summary-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M12,22L4.5,3.71L5.21,3L12,6L18.79,3L19.5,3.71L12,22Z" fill="#f44336"/>
            </svg>
          </div>
          <div className="summary-content">
            <h4>Total Expenses</h4>
            <p className="amount expense-amount">
              ${filteredTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + parseFloat(t.amount), 0).toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="summary-card balance">
          <div className="summary-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M19,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M9,19H5V13H9V19M14,19H10V13H14V19M19,19H15V13H19V19M19,11H5V5H19V11Z" fill="#2196f3"/>
            </svg>
          </div>
          <div className="summary-content">
            <h4>Net Balance</h4>
            <p className={`amount ${
              filteredTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + parseFloat(t.amount), 0) >= 
              filteredTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + parseFloat(t.amount), 0) 
              ? 'positive-balance' : 'negative-balance'
            }`}>
              ${(
                filteredTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + parseFloat(t.amount), 0) - 
                filteredTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + parseFloat(t.amount), 0)
              ).toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="summary-card top-expense">
          <div className="summary-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2,4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z" fill="#ff9800"/>
            </svg>
          </div>
          <div className="summary-content">
            <h4>Top Expense</h4>
            <p className="category-name">
              {Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0]?.[0] || "None"}
            </p>
            {Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0] && (
              <p className="category-amount">
                ${Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0]?.[1].toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>
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
        <div className="chart-item">
          <h3>Spending by Category</h3>
          <Pie data={categoryData} />
        </div>
        <div className="chart-item">
          <h3>Monthly Income vs Expense Comparison</h3>
          <Line data={comparisonData} options={{ responsive: true }} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
