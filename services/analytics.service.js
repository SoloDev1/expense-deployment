import supabase from '../config/supabase.js';

// --- Helper: Fetch raw transactions for a range ---
const getTransactionsByRange = async (userId, startDate, endDate, type = null) => {
    let query = supabase
        .from('transactions')
        .select('amount, date, type, categories(name, color, icon)')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate);

    if (type) {
        query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
};

// 1. Analyze Spending
export const analyzeSpendingByCategory = async (userId, startDate, endDate) => {
    try {
        const transactions = await getTransactionsByRange(userId, startDate, endDate, 'expense');

        // JS Aggregation: Group by Category Name
        const categoryMap = {};

        transactions.forEach(tx => {
            // Handle if category was deleted (might be null)
            const catName = tx.categories?.name || 'Uncategorized';
            const catColor = tx.categories?.color || '#cbd5e1'; // Default gray

            if (!categoryMap[catName]) {
                categoryMap[catName] = {
                    category: catName,
                    totalAmount: 0,
                    color: catColor
                };
            }
            categoryMap[catName].totalAmount += Number(tx.amount);
        });

        // Convert Map to Array
        return Object.values(categoryMap);
    } catch (error) {
        console.error("Analytics Error:", error);
        throw new Error('Error analyzing spending');
    }
};

// 2. Analyze Income
export const analyzeIncomeByCategory = async (userId, startDate, endDate) => {
    try {
        const transactions = await getTransactionsByRange(userId, startDate, endDate, 'income');

        const categoryMap = {};
        transactions.forEach(tx => {
            const catName = tx.categories?.name || 'Uncategorized';

            if (!categoryMap[catName]) {
                categoryMap[catName] = { category: catName, totalAmount: 0 };
            }
            categoryMap[catName].totalAmount += Number(tx.amount);
        });

        return Object.values(categoryMap);
    } catch (error) {
        throw new Error('Error analyzing income');
    }
};

// 3. Monthly Trends (Jan - Dec)
export const analyzeMonthlyTrends = async (userId, year) => {
    try {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        // Fetch ALL transactions for the year
        const transactions = await getTransactionsByRange(userId, startDate, endDate);

        // Initialize array for 12 months
        const monthlyData = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1, // 1 = Jan
            income: 0,
            expense: 0
        }));

        transactions.forEach(tx => {
            const date = new Date(tx.date);
            const monthIndex = date.getMonth(); // 0 = Jan

            if (tx.type === 'income') {
                monthlyData[monthIndex].income += Number(tx.amount);
            } else {
                monthlyData[monthIndex].expense += Number(tx.amount);
            }
        });

        return monthlyData;
    } catch (error) {
        throw new Error('Error analyzing monthly trends');
    }
};

// 4. Pie Chart Wrapper
export const getSpendingDistribution = async (userId, startDate, endDate) => {
    const spendingData = await analyzeSpendingByCategory(userId, startDate, endDate);

    const totalSpending = spendingData.reduce((acc, curr) => acc + curr.totalAmount, 0);

    return spendingData.map(item => ({
        name: item.category,
        value: item.totalAmount,
        color: item.color,
        percentage: totalSpending > 0 ? ((item.totalAmount / totalSpending) * 100).toFixed(1) : 0
    }));
};

// 5. Bar Chart Wrapper (Income vs Expense)
export const getIncomeVsExpense = async (userId, year) => {
    return await analyzeMonthlyTrends(userId, year);
};