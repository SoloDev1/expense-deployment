import Category from "../models/category.model.js";
import Budget from "../models/budget.model.js";

import Transaction from "../models/transaction.model.js";

// Get all categories for a user
export const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({ userId: req.user._id }).sort({ name: 1 });
        res.status(200).json({ data: categories });
    } catch (error) {
        next(error);
    }
};

export const getCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await Category.findOne({ userId: req.user._id, _id: id });
        if (!category) {
            const error = new Error("Category not found");  
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ data: category });
    } catch (error) {
        next(error);
    }
};

// Create a new category
export const createCategory = async (req, res, next) => {
    try {
        const { name, type } = req.body;    
        if (!name || !type) {
            const error = new Error("Name and type are required");
            error.statusCode = 400;
            throw error;
        }
        const newCategory = new Category({
            userId: req.user._id,
            name,
            type,
        });
        await newCategory.save();
        res.status(201).json({ message: "Category created", data: newCategory });
    }
    catch (error) {
        next(error);
    }
};

// Update a category
export const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;  
        const { name, type } = req.body;
        const category = await Category.findOne({userId: req.user._id, _id: id});
        if(!category){
            const error = new Error("Category not found");
            error.statusCode = 404;
            throw error;
        }

        category.name = name || category.name;
        category.type = type || category.type;
        await category.save();
        res.status(200).json({ message: "Category updated", data: category });
    } catch (error) {
        next(error);
    }
};


// Delete a category
export const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;  
        const category = await Category.findOne({userId: req.user._id, _id: id});
        if(!category){
            const error = new Error("Category not found");
            error.statusCode = 404;
            throw error;
        }

        const hasTransactions = await Transaction.exists({
            categoryId: id,
            userId: req.user._id
        });

        if (hasTransactions) {
            const error = new Error("Cannot delete category with existing transactions");
            error.statusCode = 400;
            throw error;
        }

        await Category.deleteOne({ _id: id, userId: req.user._id });
        await Budget.deleteMany({ categoryId: id, userId: req.user._id });


       
        res.status(200).json({ message: "Category deleted" });
    } catch (error) {
        next(error);
    }
};

