const express = require('express');
const router = express.Router();
const {getBudgetSuggestions} = require('../controllers/suggestionController');

// Get /api/suggestions/:userId
router.get('/:userId', getBudgetSuggestions);

module.exports = router;