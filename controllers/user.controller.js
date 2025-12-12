import supabase from '../config/supabase.js';
import supabaseUser from '../config/user.supabase.js';

export const getUserProfile = async (req, res, next) => {
  res.status(200).json({ data: req.user });
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const { name, currency, darkMode } = req.body;
    const userId = req.user.id;

    const updates = {};
    if (name) updates.name = name;
    if (currency) updates.currency = currency;
    if (darkMode !== undefined) updates.dark_mode = darkMode;

    const { data, error } = await supabaseUser
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    if (name) {
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { name }
      });
    }

    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

export const deleteUserAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await supabase.auth.admin.deleteUser(userId);
    res.status(200).json({ message: 'Account deleted' });
  } catch (error) {
    next(error);
  }
};
