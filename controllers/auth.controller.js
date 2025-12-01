import supabase from '../config/supabase.js';

// --- HELPER: Create Default Categories with Visuals ---
const createDefaultCategories = async (userId) => {
    const defaultCategories = [
        { name: 'Salary', type: 'income', icon: 'wallet', color: '#10B981', user_id: userId }, // Green
        { name: 'Freelance', type: 'income', icon: 'laptop', color: '#3B82F6', user_id: userId }, // Blue
        { name: 'Food', type: 'expense', icon: 'pizza', color: '#F59E0B', user_id: userId }, // Orange
        { name: 'Rent', type: 'expense', icon: 'home', color: '#EF4444', user_id: userId }, // Red
        { name: 'Utilities', type: 'expense', icon: 'bolt', color: '#6366F1', user_id: userId }, // Indigo
        { name: 'Entertainment', type: 'expense', icon: 'film', color: '#EC4899', user_id: userId }, // Pink
    ];

    const { error } = await supabase
        .from('categories')
        .insert(defaultCategories);

    if (error) {
        console.error('Error creating default categories:', error.message);
    }
};

// 1. Standard Sign Up
export const signUp = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } } // Metadata for trigger
        });

        if (authError) throw authError;

        if (authData.user) {
            // SAFETY DELAY: The SQL Trigger 'on_auth_user_created' needs about 100-500ms 
            // to create the row in public.users. We wait briefly to avoid Foreign Key errors.
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await createDefaultCategories(authData.user.id);
        }

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { user: authData.user, session: authData.session }
        });
    } catch (error) {
        next(error);
    }
}

// 2. Standard Sign In
export const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        res.status(200).json({
            success: true,
            message: 'User signed in successfully',
            data: { 
                token: data.session.access_token, 
                user: data.user 
            }
        });
    } catch (error) {
        next(error);
    }
}

// 3. Google Sign In
export const googleSignIn = async (req, res, next) => {
    try {
        const { tokenId } = req.body; // Google ID Token from Frontend

        const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: tokenId,
        });

        if (error) throw error;

        // Check if categories exist (i.e., is this a new user?)
        const { count } = await supabase
            .from('categories')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', data.user.id);

        if (count === 0) {
            // Safety delay not strictly needed here as login usually implies user exists,
            // but for first-time social login, the trigger still runs.
            await new Promise(resolve => setTimeout(resolve, 500));
            await createDefaultCategories(data.user.id);
        }

        res.status(200).json({
            success: true,
            message: 'Google login successful',
            data: { token: data.session.access_token, user: data.user }
        });

    } catch (error) {
        next(error);
    }
};

// 4. Apple Sign In
export const appleSignIn = async (req, res, next) => {
    try {
        const { identityToken, fullName } = req.body;

        const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'apple',
            token: identityToken,
        });

        if (error) throw error;

        // Apple only sends 'fullName' on the VERY FIRST login.
        if (fullName) {
            const name = `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim();
            if (name) {
                // Update Auth Metadata
                await supabase.auth.updateUser({ data: { name } });
                
                // Update Public Table
                await supabase.from('users').update({ name }).eq('id', data.user.id);
            }
        }

        // Check for default categories
        const { count } = await supabase
            .from('categories')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', data.user.id);

        if (count === 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
            await createDefaultCategories(data.user.id);
        }

        res.status(200).json({
            success: true,
            message: 'Apple login successful',
            data: { token: data.session.access_token, user: data.user }
        });

    } catch (error) {
        next(error);
    }
};

// 5. Sign Out
export const signOut = async (req, res, next) => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        res.status(200).json({
            success: true,
            message: 'User signed out successfully'
        });
    } catch (error) {
        next(error);
    }
}