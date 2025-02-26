const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/register', async (req, res) => {
  try {
    console.log('Registration Request Body:', req.body); // Log incoming data

    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ msg: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    console.log('User saved to DB:', newUser.email); // Confirm DB write
    res.status(201).json({ msg: 'User registered' });
  } catch (err) {
    console.error('Registration Route Error:', err.message); // Detailed error
    res.status(500).json({ error: err.message });
  }
});

router.get('/user', async (req, res) => {
  try {
    console.log('[Backend] Authorization Header:', req.headers.authorization); // Log the token

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ msg: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[Backend] Decoded Token:', decoded); // Log decoded token data

    const user = await User.findById(decoded.id).select('-password');
    console.log('[Backend] User Found:', user); // Log the user data

    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('[Backend] Profile Error:', err.message);
    res.status(401).json({ msg: 'Invalid token' });
  }
});


module.exports = router;