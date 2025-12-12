import supabase from '../config/supabase.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const { data } = await supabaseAdmin.from('users').select('*');
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const { data } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });

    res.status(201).json({ data: data.user });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .single();

    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    const { name, currency, darkMode } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (currency) updates.currency = currency;
    if (darkMode !== undefined) updates.dark_mode = darkMode;

    const { data } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (name) {
      await supabase.auth.admin.updateUserById(req.params.id, {
        user_metadata: { name }
      });
    }

    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    await supabase.auth.admin.deleteUser(req.params.id);
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};
