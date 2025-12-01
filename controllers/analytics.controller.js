import * as analyticsService from '../services/analytics.service.js';

// 1. Spending by Category
export const getSpendingAnalytics = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            const error = new Error("Start date and End date are required");
            error.statusCode = 400;
            throw error;
        }

        const data = await analyticsService.analyzeSpendingByCategory(req.user.id, startDate, endDate);

        res.status(200).json({
            success: true,
            message: 'Spending analytics retrieved',
            data
        });
    } catch (error) {
        next(error);
    }
};

// 2. Income by Category
export const getIncomeAnalytics = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            const error = new Error("Start date and End date are required");
            error.statusCode = 400;
            throw error;
        }

        const data = await analyticsService.analyzeIncomeByCategory(req.user.id, startDate, endDate);

        res.status(200).json({
            success: true,
            message: 'Income analytics retrieved',
            data
        });
    } catch (error) {
        next(error);
    }
};

// 3. Monthly Trends (Bar Chart)
export const getMonthlyTrendsAnalytics = async (req, res, next) => {
    try {
        const { year } = req.query;
        const currentYear = year || new Date().getFullYear();

        const data = await analyticsService.analyzeMonthlyTrends(req.user.id, currentYear);

        res.status(200).json({
            success: true,
            message: 'Monthly trends retrieved',
            data
        });
    } catch (error) {
        next(error);
    }
};

// 4. Combined Dashboard Data (Pie + Bar)
export const getChartsData = async (req, res, next) => {
    try {
        // Defaults to current year and current month view
        const today = new Date();
        const year = today.getFullYear();

        // Calculate start/end of current month for the Pie Chart
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

        const spendingDistribution = await analyticsService.getSpendingDistribution(req.user.id, startOfMonth, endOfMonth);
        const incomeVsExpense = await analyticsService.getIncomeVsExpense(req.user.id, year);

        res.status(200).json({
            success: true,
            message: 'Charts data retrieved successfully',
            data: {
                spendingDistribution, // For Pie Chart
                incomeVsExpense       // For Bar Chart
            }
        });
    } catch (error) {
        next(error);
    }
};