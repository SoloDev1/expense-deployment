import supabase from '../config/supabase.js';

export const authorize = async (req, res, next) => {
    try {
        // 1. Robust Token Extraction
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        // 2. Verify Token (Essential Security Step)
        // usage of getUser is correct (checks revocation/validity server-side)
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !authUser) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        // 3. Fetch Profile (The "Expensive" Step)
        // Optimization Note: Only keep this block if your routes absolutely require 
        // fields like 'username' or 'role' from the public table.
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();

        // 4. Handle Data Integrity Issues
        if (profileError || !userProfile) {
            console.error(`Integrity Error: User ${authUser.id} exists in Auth but not in public.users`);
            // We still return 401 or 403 to the client, but we log the specific issue for the dev.
            return res.status(401).json({ message: 'User profile could not be verified' });
        }

        // 5. Attach Unified User Object
        // It is often helpful to keep the Auth email separate or ensure it's merged correctly.
        req.user = {
            ...userProfile,
            email: authUser.email, // Ensure email is available even if not in public table
            auth_id: authUser.id    // Explicit reference to the Auth ID
        };

        next();

    } catch (error) {
        console.error('Authorization Middleware Error:', error);
        res.status(500).json({ message: 'Internal Server Error during authorization' });
    }
};