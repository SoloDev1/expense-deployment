import supabase from '../config/supabase.js';

// Centralized defaults for fields not yet in your DB
const DEFAULT_PREFERENCES = {
    notifications: true,
    dateFormat: 'YYYY-MM-DD',
    language: 'en'
};

// 1. Get User Settings
export const getUserSettings = async (req, res, next) => {
    try {
        // req.user is populated by your 'authorize' middleware.
        // It saves us a database call!

        const settings = {
            // Database fields
            currency: req.user.currency || 'USD',
            darkMode: req.user.dark_mode, // specific to your SQL column name

            // App-level defaults (for features not yet in DB)
            ...DEFAULT_PREFERENCES
        };

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        next(error);
    }
};

// 2. Update User Settings
export const updateUserSettings = async (req, res, next) => {
    try {
        // Validation: Ensure we are looking at the body, not params
        const { currency, darkMode } = req.body;

        const updateData = {};

        // Validation: Currency should be a 3-letter code (e.g., 'USD', 'NGN')
        if (currency) {
            if (currency.length !== 3) {
                const error = new Error("Currency must be a 3-letter code (e.g., USD)");
                error.statusCode = 400;
                throw error;
            }
            updateData.currency = currency.toUpperCase();
        }

        // Validation: Boolean check
        if (darkMode !== undefined) {
            updateData.dark_mode = Boolean(darkMode);
        }

        // Check if there is anything to update
        if (Object.keys(updateData).length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No changes provided',
                data: {
                    currency: req.user.currency,
                    darkMode: req.user.dark_mode,
                    ...DEFAULT_PREFERENCES
                }
            });
        }

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', req.user.id) // Secure: Use ID from token, not body
            .select()
            .single();

        if (error) throw error;

        // Return the full combined settings
        const settings = {
            currency: data.currency,
            darkMode: data.dark_mode,
            ...DEFAULT_PREFERENCES
        };

        res.status(200).json({
            success: true,
            message: 'Settings updated successfully',
            data: settings
        });

    } catch (error) {
        next(error);
    }
};