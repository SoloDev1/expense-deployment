import Transaction from '../models/transaction.model.js';

export const analyzeSpendingByCategory = async (userId, startDate, endDate) => {
    try {   
        const transactions = await Transaction.aggregate([
            { $match: { userId: userId, date: { $gte: new Date(startDate), $lte: new Date(endDate) }, type: 'expense' } },
            {
                $group: {
                    _id: '$categoryId',
                    totalAmount: { $sum: '$amount' }
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $unwind: '$category'
            },
            {
                $project: {
                    _id: 0,
                    category: '$category.name',
                    totalAmount: 1
                }
            }
        ]);

        return transactions;
    } catch (error) {
        throw new Error('Error analyzing spending by category');
    }
};


export const analyzeIncomeByCategory = async (userId, startDate, endDate) => {
    try {
        const transactions = await Transaction.aggregate([
            { $match: { userId: userId, date: { $gte: new Date(startDate), $lte: new Date(endDate) }, type: 'income' } },
            {
                $group: {
                    _id: '$categoryId',
                    totalAmount: { $sum: '$amount' }
                }   
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'category'
                }   
            },
            {
                $unwind: '$category'
            },
            {
                $project: {
                    _id: 0,
                    category: '$category.name',
                    totalAmount: 1
                }   
            }
        ]);
        return transactions;
    } catch (error) {
        throw new Error('Error analyzing income by category');
    }
};

export const analyzeMonthlyTrends = async (userId, year) => {
    try {
        const transactions = await Transaction.aggregate([
            { $match: { userId: userId, date: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } } },
            {
                $group: {
                    _id: { month: { $month: '$date' }, type: '$type' },
                    totalAmount: { $sum: '$amount' }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: '$_id.month',
                    type: '$_id.type',
                    totalAmount: 1
                }
            },
        ]);
        return transactions;
    } catch (error) {
        throw new Error('Error analyzing monthly trends');
    }
};

// Pie Chart Data
export const getSpendingDistribution = async (userId, startDate, endDate) => {
    try {
        const spendingData = await analyzeSpendingByCategory(userId, startDate, endDate);
        const totalSpending = spendingData.reduce((acc, curr) => acc + curr.totalAmount, 0);
        const distribution = spendingData.map(item => ({
            category: item.category,
            amount: item.totalAmount,
            percentage: ((item.totalAmount / totalSpending) * 100).toFixed(2)
        }));
        return distribution;
    }
    catch (error) {
        throw new Error('Error getting spending distribution');
    }

};

// Bar Chart Data
export const getIncomeVsExpense = async (userId, year) => {
    try {
        const monthlyData = await analyzeMonthlyTrends(userId, year);
        const incomeVsExpense = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            income: 0,
            expense: 0
        }));
        monthlyData.forEach(item => {
            const monthIndex = item.month - 1;
            if (item.type === 'income') {
                incomeVsExpense[monthIndex].income = item.totalAmount;
            } else if (item.type === 'expense') {
                incomeVsExpense[monthIndex].expense = item.totalAmount;
            }
        });
        return incomeVsExpense;
    } catch (error) {
        throw new Error('Error getting income vs expense');
    }
};

