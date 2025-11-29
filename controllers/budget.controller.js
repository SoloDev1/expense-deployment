import Budget from "../models/budget.model.js";

export const createBudget = async (req, res, next) => {
  try {
    const { categoryId, limit, month, alertThreshold } = req.body;

    if (!categoryId || !limit || !month) {
      const error = new Error("Category, limit and month are required");
      error.statusCode = 400;
      throw error;
    }

    const exists = await Budget.findOne({
      userId: req.user._id,
      categoryId,
      month
    });

    if (exists) {
      const error = new Error("Budget for this category already exists this month");
      error.statusCode = 409;
      throw error;
    }

    const budget = await Budget.create({
      userId: req.user._id,
      categoryId,
      limit,
      month,
      alertThreshold
    });

    res.status(201).json({
      success: true,
      message: "Budget created",
      data: budget
    });
  } catch (error) {
    next(error);
  }
};

export const getBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id });

    res.status(200).json({ success: true, data: budgets });
  } catch (error) {
    next(error);
  }
};

export const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!budget) {
      const error = new Error("Budget not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

export const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!budget) {
      const error = new Error("Budget not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Budget deleted"
    });
  } catch (error) {
    next(error);
  }
};
