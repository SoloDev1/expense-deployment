import supabaseUser from '../config/user.supabase.js';

// 1. Create a new transaction 
export const createTransaction = async (req, res, next) => {
    try {
        const { amount, type, categoryId, date, description } = req.body;

        // Validation: Use strictly checks (amount !== undefined) to allow 0 if needed
        if (amount === undefined || !type || !categoryId) {
            const error = new Error("Amount, type, and categoryId are required");
            error.statusCode = 400;
            throw error;
        }

        // Validate Type matches SQL constraint
        if (!['income', 'expense'].includes(type)) {
            const error = new Error("Type must be 'income' or 'expense'");
            error.statusCode = 400;
            throw error;
        }

        const { data, error } = await supabaseUser
            .from('transactions')
            .insert({
                user_id: req.user.id, // Comes from your authorize middleware
                amount,
                type,
                category_id: categoryId,
                date: date || new Date(), // Defaults to now if missing
                description
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ message: "Transaction created", data });
    } catch (error) {
        next(error);
    }
};

// 6. Get Dashboard Summary (Optimized with Promise.all)
export const getDashboardSummary = async (req, res, next) => {
    try {
        // Prepare the 3 promises but don't await them individually yet
        const incomePromise = supabaseUser
            .from('transactions')
            .select('amount.sum()')
            .eq('user_id', req.user.id)
            .eq('type', 'income');

        const expensePromise = supabaseUser
            .from('transactions')
            .select('amount.sum()')
            .eq('user_id', req.user.id)
            .eq('type', 'expense');

        const recentPromise = supabaseUser
            .from('transactions')
            .select('*, categories(name, icon, color)')
            .eq('user_id', req.user.id)
            .order('date', { ascending: false })
            .limit(5);

        // Fire them all at once and wait for all to finish
        const [
            { data: incomeData, error: incomeError },
            { data: expenseData, error: expenseError },
            { data: recent, error: recentError }
        ] = await Promise.all([incomePromise, expensePromise, recentPromise]);

        // Check for errors (fail fast)
        if (incomeError) throw incomeError;
        if (expenseError) throw expenseError;
        if (recentError) throw recentError;

        // Parse results
        const totalIncome = incomeData[0]?.sum || 0;
        const totalExpense = expenseData[0]?.sum || 0;

        res.status(200).json({
            totalBalance: totalIncome - totalExpense,
            income: totalIncome,
            expense: totalExpense,
            recentTransactions: recent
        });

    } catch (error) {
        next(error);
    }
};

// 2. Get transactions (Added Pagination & Filtering)
export const getTransactions = async (req, res, next) => {
    try {
        const { type, page = 1, limit = 20 } = req.query;

        // Calculate pagination range for Supabase
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabaseUser
            .from('transactions')
            .select('*, categories(name, icon, color)', { count: 'exact' }) // Get total count too
            .eq('user_id', req.user.id)
            .order('date', { ascending: false })
            .range(from, to); // Apply pagination

        if (type) {
            query = query.eq('type', type);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        res.status(200).json({
            data,
            meta: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// 3. Get a transaction by ID
export const getTransactionById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabaseUser
            .from('transactions')
            .select('*, categories(*)')
            .eq('user_id', req.user.id) // Security: Ensure they own it
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) {
            const error = new Error("Transaction not found");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ data });
    } catch (error) {
        next(error);
    }
};

// 4. Update a transaction
export const updateTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amount, type, categoryId, date, description } = req.body;

        const updates = {};
        // Strict undefined checks allow updating values to 0 or empty strings if needed
        if (amount !== undefined) updates.amount = amount;
        if (type) updates.type = type;
        if (categoryId) updates.category_id = categoryId;
        if (date) updates.date = date;
        if (description !== undefined) updates.description = description;

        // Security: We must use .eq('user_id', req.user.id) so they can't update someone else's row
        const { data, error } = await supabaseUser
            .from('transactions')
            .update(updates)
            .eq('user_id', req.user.id)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // If no data returned, it means the row didn't exist or didn't belong to user
        if (!data) {
            const error = new Error("Transaction not found or unauthorized");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ message: "Transaction updated", data });

    } catch (error) {
        next(error);
    }
};


// 5. Delete a transaction
export const deleteTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Supabase delete returns status 204 (No Content) usually, 
        // but we can ask for the deleted row to ensure it existed.
        const { data, error } = await supabaseUser
            .from('transactions')
            .delete()
            .eq('user_id', req.user.id)
            .eq('id', id)
            .select(); // Select returns the deleted row

        if (error) throw error;

        // If data array is empty, nothing was deleted (ID didn't exist)
        if (!data || data.length === 0) {
            const error = new Error("Transaction not found");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ message: "Transaction deleted" });
    } catch (error) {
        next(error);
    }
};