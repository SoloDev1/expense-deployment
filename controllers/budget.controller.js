import supabaseUser from '../config/user.supabase.js';

// 1. Create a Budget
export const createBudget = async (req, res, next) => {
  try {
    const { categoryId, limit, month } = req.body;

    // Validation: Check strict undefined for limit (allows 0, though unlikely for a budget)
    if (!categoryId || limit === undefined || !month) {
      const error = new Error("Category, limit, and month (YYYY-MM) are required");
      error.statusCode = 400;
      throw error;
    }

    // Standardize dates
    // month input: "2023-11"
    // start_date: "2023-11-01"
    const startDate = `${month}-01`;

    // Calculate end of month for the record (optional but good for data integrity)
    const [year, monthNum] = month.split('-');
    const endDate = new Date(year, monthNum, 0).toISOString().split('T')[0]; // Last day of month

    // Check for existing budget to prevent duplicates
    const { data: existing } = await supabaseUser
      .from('budgets')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('category_id', categoryId)
      .eq('start_date', startDate)
      .single();

    if (existing) {
      const error = new Error("A budget for this category already exists for this month");
      error.statusCode = 409; // Conflict
      throw error;
    }

    const { data, error } = await supabaseUser
      .from('budgets')
      .insert({
        user_id: req.user.id,
        category_id: categoryId,
        amount: limit,
        period: 'monthly',
        start_date: startDate,
        end_date: endDate
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, message: "Budget created", data });
  } catch (error) {
    next(error);
  }
};

// 2. Get Budgets (Optimized: Solves N+1 Problem)
export const getBudgets = async (req, res, next) => {
  try {
    // Allow filtering by month (default to current month)
    const { month } = req.query;
    const currentMonth = month || new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const startDate = `${currentMonth}-01`;

    // Calculate end date for the filter
    const [year, monthNum] = currentMonth.split('-');
    const endDate = new Date(year, monthNum, 0).toISOString().split('T')[0];

    // REQUEST 1: Get all budgets for this month
    const { data: budgets, error: budgetError } = await supabaseUser
      .from('budgets')
      .select('*, categories(name, color, icon)')
      .eq('user_id', req.user.id)
      .eq('start_date', startDate);

    if (budgetError) throw budgetError;

    // If no budgets exist, return empty early
    if (!budgets || budgets.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // REQUEST 2: Get ALL expenses for this month in ONE go
    // Instead of querying inside a loop, we fetch the bulk data once.
    const { data: transactions, error: txError } = await supabaseUser
      .from('transactions')
      .select('category_id, amount')
      .eq('user_id', req.user.id)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate);

    if (txError) throw txError;

    // JavaScript Aggregation (Fast)
    // We map over the budgets and sum up the matching transactions from our list
    const budgetsWithSpent = budgets.map(budget => {
      const spent = transactions
        .filter(t => t.category_id === budget.category_id)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return { ...budget, spent };
    });

    res.status(200).json({ success: true, data: budgetsWithSpent });
  } catch (error) {
    next(error);
  }
};

// 3. Update Budget
export const updateBudget = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit } = req.body;

    if (limit === undefined) {
      const error = new Error("Limit is required");
      error.statusCode = 400;
      throw error;
    }

    const { data, error } = await supabaseUser
      .from('budgets')
      .update({ amount: limit })
      .eq('user_id', req.user.id)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Handle "Not Found" vs "DB Error"
    if (!data) {
      const error = new Error("Budget not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// 4. Delete Budget
export const deleteBudget = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseUser
      .from('budgets')
      .delete()
      .eq('user_id', req.user.id)
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      const error = new Error("Budget not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, message: "Budget deleted" });
  } catch (error) {
    next(error);
  }
};