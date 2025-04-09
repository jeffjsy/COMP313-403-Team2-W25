const { getUserTransactions, getUserGoals } = require('../utils/userDataFetcher');
const { generateGeminiResponse } = require('../utils/geminiHelper');

exports.getBudgetSuggestions = async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch user data (transactions + goals)
        const transactions = await getUserTransactions(userId);
        const goals = await getUserGoals(userId);

        const prompt = `
You are a personal finance assistant. Analyze the following user data and 
suggest 3 personalized tips to help them save money and reach their goals faster.

Transactions: ${JSON.stringify(transactions, null, 2)}
Goals: ${JSON.stringify(goals, null, 2)}

Keep your tips short and actionable.
    `;

        const suggestions = await generateGeminiResponse(prompt);

        res.status(200).json({ suggestions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate suggestions' });
    }
};
