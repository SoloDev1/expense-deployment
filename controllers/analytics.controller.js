import {
    analyzeSpendingByCategory,
    analyzeIncomeByCategory,
    analyzeMonthlyTrends,
    getSpendingDistribution,
    getIncomeVsExpense
} from '../services/analytics.service.js';

// Controller for Spending by Category
export const getSpendingAnalytics = async (req, res) => {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    try {
        const data = await analyzeSpendingByCategory(userId, startDate, endDate);
        res.status(200).json({ success: true, message: 'Spending analytics retrieved successfully', data: spending });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Controller for Income by Category
export const getIncomeAnalytics = async (req, res) => {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    try {
        const data = await analyzeIncomeByCategory(userId, startDate, endDate);
        res.status(200).json({ success: true, message: 'Income analytics retrieved successfully', data: income });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Controller for Monthly Trends
export const getMonthlyTrendsAnalytics = async (req, res) => {
    const { userId } = req.params;
    const { year } = req.query;
    try {
        const data = await analyzeMonthlyTrends(userId, year);  
        res.status(200).json({ success: true, message: 'Monthly trends retrieved successfully', data: monthlyTrends});
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }   
};

// Controller for Spending Distribution

export const getChartsData = async (req, res) => {
    const { userId } = req.params;
    try {
        const spendingDistribution = await getSpendingDistribution(userId);
        const incomeVsExpense = await getIncomeVsExpense(userId);
        res.status(200).json({
            success: true,
            message: 'Charts data retrieved successfully',
            data: {
                spendingDistribution,
                incomeVsExpense
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};