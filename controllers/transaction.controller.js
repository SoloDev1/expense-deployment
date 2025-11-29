import Transaction from "../models/transaction.model.js";
import Budget from "../models/budget.model.js";

// Create a new transaction 

export const createTransaction = async (req, res, next) => {
    try {
        const { amount, type, categoryId, date, description } = req.body;
        if (!amount || !type || !categoryId || !date) {
            const error = new Error("Amount, type, categoryId, and date are required");
            error.statusCode = 400;
            throw error;
        }

        const newTransaction = new Transaction({
            userId: req.user._id,
            amount,
            type,
            categoryId,
            date: date || new Date(),
            description
        });
        await newTransaction.save();

        // Update budget spent
        const month = newTransaction.date.toISOString().slice(0, 7);
        await Budget.findOneAndUpdate(
            { userId: req.user._id, categoryId, month },
            { $inc: { spent: amount } },
            { upsert: true, new: true }
        );

        res.status(201).json({ message: "Transaction created", data: newTransaction });
    } catch (error) {
        next(error);
    }
};

// Get transactions for a user, with optional type filter


export const getTransactions = async (req, res, next) => {
    try {
        const { type } = req.query; // optional filter
        const filter = { userId: req.user._id };
        if (type) filter.type = type;

        const transactions = await Transaction.find(filter).sort({ date: -1 });
        res.status(200).json({ data: transactions });
    } catch (error) {
        next(error);
    }
};

// Get a transaction by ID
export const getTransactionById = async (req, res, next) => {
    try { 
        const { id } = req.params;
        const transaction = await Transaction.findOne({ _id: id, userId: req.user._id });
        if (!transaction) {
            const error = new Error("Transaction not found");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ data: transaction });
    } catch (error) {
        next(error);
    }
};

// Update a transaction
export const updateTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amount, type, categoryId, date, description } = req.body;

        // Find old transaction
        const oldTx = await Transaction.findOne({ _id: id, userId: req.user._id });
        if (!oldTx) {
            const error = new Error("Transaction not found");
            error.statusCode = 404;
            throw error;
        }

        const oldAmount = oldTx.amount;
        const oldCategory = oldTx.categoryId;
        const oldMonth = oldTx.date.toISOString().slice(0, 7);

        // Apply updates
        if (amount) oldTx.amount = amount;
        if (type) oldTx.type = type;
        if (categoryId) oldTx.categoryId = categoryId;
        if (date) oldTx.date = date;
        if (description) oldTx.description = description;

        await oldTx.save();

        // NEW values
        const newAmount = oldTx.amount;
        const newCategory = oldTx.categoryId;
        const newMonth = oldTx.date.toISOString().slice(0, 7);

        // --- Update Budgets ---

        // 1) Subtract old amount from old budget
        await Budget.findOneAndUpdate(
            { userId: req.user._id, categoryId: oldCategory, month: oldMonth },
            { $inc: { spent: -oldAmount } }
        );

        // 2) Add new amount to new budget
        await Budget.findOneAndUpdate(
            { userId: req.user._id, categoryId: newCategory, month: newMonth },
            { $inc: { spent: newAmount } },
            { upsert: true }
        );

        res.status(200).json({ message: "Transaction updated", data: oldTx });

    } catch (error) {
        next(error);
    }
};


// Delete a transaction


export const deleteTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;  
        const transaction = await Transaction.findOneAndDelete({ _id: id, userId: req.user._id });

        if (!transaction) {
            const error = new Error("Transaction not found");
            error.statusCode = 404;
            throw error;
        }  
        // Update budget spent
        const month = transaction.date.toISOString().slice(0, 7);
        await Budget.findOneAndUpdate(
            { userId: req.user._id, categoryId: transaction.categoryId, month },
            { $inc: { spent: -transaction.amount } }
        );

        res.status(200).json({ message: "Transaction deleted" });
    } catch (error) {
        next(error);
    }
};