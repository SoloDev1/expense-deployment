import supabase from '../config/supabase.js';

// Get user profile
export const getUserProfile = async (req, res, next) => {
    try {
        // req.user is already populated by middleware
        res.status(200).json({ data: req.user });
    } catch (error) {
        next(error);
    }
};

// Update user profile
export const updateUserProfile = async (req, res, next) => {
    try {
        const { name, currency, darkMode } = req.body;
        const userId = req.user.id;

        const updates = {};
        if (name) updates.name = name;
        if (currency) updates.currency = currency;
        if (darkMode !== undefined) updates.dark_mode = darkMode;

        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        // Also update Auth metadata if name changed (optional but good for consistency)
        if (name) {
            await supabase.auth.admin.updateUserById(userId, { user_metadata: { name } });
        }

        res.status(200).json({ data });
    } catch (error) {
        next(error);
    }
};

// Delete user account
export const deleteUserAccount = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Delete from Supabase Auth (this will cascade delete public.users if configured, or trigger)
        // Our schema has ON DELETE CASCADE on public.users referencing auth.users?
        // Actually schema says: id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
        // So deleting auth user will delete public user.

        const { error } = await supabase.auth.admin.deleteUser(userId);

        if (error) throw error;

        res.status(200).json({ message: "User account deleted successfully" });
    } catch (error) {
        next(error);
    }
};

// Admin: Get all users
export const getAllUsers = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*');

        if (error) throw error;

        res.status(200).json({ data });
    } catch (error) {
        next(error);
    }
};

// Admin: Create a new user
export const createUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!email || !password) {
            const error = new Error("Email and password are required");
            error.statusCode = 400;
            throw error;
        }

        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            user_metadata: { name },
            email_confirm: true
        });

        if (error) throw error;

        // Trigger handles public.users creation

        res.status(201).json({ data: data.user });
    } catch (error) {
        next(error);
    }
};

// Admin: Get user by ID
export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ data });
    } catch (error) {
        next(error);
    }
};

// Admin: Update user by ID
export const updateUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, currency, darkMode } = req.body; // Cannot update email/password directly here easily without admin auth api

        const updates = {};
        if (name) updates.name = name;
        if (currency) updates.currency = currency;
        if (darkMode !== undefined) updates.dark_mode = darkMode;

        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        if (name) {
            await supabase.auth.admin.updateUserById(id, { user_metadata: { name } });
        }

        res.status(200).json({ data });
    } catch (error) {
        next(error);
    }
};

// Admin: Delete user by ID
export const deleteUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.auth.admin.deleteUser(id);

        if (error) throw error;

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        next(error);
    }
};
