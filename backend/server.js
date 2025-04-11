require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const authRoutes = require('./routes/Auth');
const goalRoutes = require('./routes/goalRoutes');
const budgetsRoutes = require('./routes/budgetRoutes');
const recurringRoutes = require('./routes/recurringRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cronJobs = require('./utils/cronJobs');
const helmet = require('helmet');
const path = require('path');

// express
const app = express();

// Use helmet with custom CSP configuration
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(express.static(path.join(__dirname, 'frontend', 'public')));

app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/budgets', budgetsRoutes);
app.use('/api/recurring-transactions', recurringRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suggestions', require('./routes/suggestionRoutes'));

// Start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

app.use(cors({
  origin: 'https://budget-planner-frontend-czda.onrender.com/',
  credentials: true,
}));