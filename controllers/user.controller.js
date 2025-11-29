
import User from '../models/user.model.js';

// Get user profile
export const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json({ data: user });
    } catch (error) {
        next(error);
    }
};

// Update user profile
export const updateUserProfile = async (req, res, next) => { 
    try {
        const { name, email, password } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }
        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = password;

        await user.save();
        res.status(200).json({ data: user });
    } catch (error) {
        next(error);
    }
};

// Delete user account
export const deleteUserAccount = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ message: "User account deleted successfully" });
    } catch (error) {
        next(error);
    }
};

// Admin: Get all users
export const getAllUsers = async (req, res, next) => {
    try {   
        const users = await User.find().select('-password');
        res.status(200).json({ data: users });
    } catch (error) {
        next(error);
    }   
};

// Admin: Create a new user
export const createUser = async (req, res, next) => {   
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            const error = new Error("Name, email, and password are required");
            error.statusCode = 400;
            throw error;
        }
        const newUser = new User({ name, email, password });
        await newUser.save();
        res.status(201).json({ data: newUser });
    } catch (error) {
        next(error);
    }
};

// Admin: Get, update, delete user by ID

// Get user by ID
export const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ data: user });
    } catch (error) {
        next(error);
    }
};

// Admin: Update user by ID

export const updateUserById = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }
        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = password;

        await user.save();
        res.status(200).json({ data: user });
    } catch (error) {
        next(error);
    }
};

// Admin: Delete user by ID

export const deleteUserById = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);   
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }   


        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        next(error);
    }       
};

