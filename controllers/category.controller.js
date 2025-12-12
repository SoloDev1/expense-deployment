import supabaseUser from '../config/user.supabase.js';

// 1. Get all categories
export const getCategories = async (req, res, next) => {
    try {
        const { data, error } = await supabaseUser
            .from('categories')
            .select('*')
            .eq('user_id', req.user.id)
            .order('name', { ascending: true });

        if (error) throw error;

        res.status(200).json({ data });
    } catch (error) {
        next(error);
    }
};

// 2. Get single category
export const getCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabaseUser
            .from('categories')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('id', id)
            .single();

        if (error) throw error;

        if (!data) {
            const error = new Error("Category not found");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ data });
    } catch (error) {
        next(error);
    }
};

// 3. Create a new category (Fixed: Added Icon & Color)
export const createCategory = async (req, res, next) => {
    try {
        const { name, type, icon, color } = req.body;

        // Validation
        if (!name || !type) {
            const error = new Error("Name and type are required");
            error.statusCode = 400;
            throw error;
        }

        // Strict Type Check
        if (!['income', 'expense'].includes(type)) {
            const error = new Error("Type must be 'income' or 'expense'");
            error.statusCode = 400;
            throw error;
        }

        const { data, error } = await supabaseUser
            .from('categories')
            .insert({
                user_id: req.user.id,
                name,
                type,
                icon: icon || 'tag', // Default icon if none provided
                color: color || '#94A3B8' // Default gray if none provided
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ message: "Category created", data });
    }
    catch (error) {
        next(error);
    }
};

// 4. Update a category (Fixed: Added Icon & Color updates)
export const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, type, icon, color } = req.body;

        const updates = {};
        if (name) updates.name = name;
        if (type) updates.type = type;
        if (icon) updates.icon = icon;
        if (color) updates.color = color;

        const { data, error } = await supabaseUser
            .from('categories')
            .update(updates)
            .eq('user_id', req.user.id)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            const error = new Error("Category not found");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ message: "Category updated", data });
    } catch (error) {
        next(error);
    }
};


// 5. Delete a category (Fixed: Removed Transaction Check)
export const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseUser
            .from('categories')
            .delete()
            .eq('user_id', req.user.id)
            .eq('id', id)
            .select(); // Select to confirm deletion

        if (error) throw error;

        if (!data || data.length === 0) {
            const error = new Error("Category not found");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ message: "Category deleted" });
    } catch (error) {
        next(error);
    }
};