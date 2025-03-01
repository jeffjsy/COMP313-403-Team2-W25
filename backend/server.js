require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const authRoutes = require('./routes/Auth');
const goalRoutes = require('./routes/goalRoutes');

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);

// Start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));