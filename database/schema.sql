-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES
-- USERS
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')), 
  currency TEXT DEFAULT 'USD',
  dark_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRANSACTIONS
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  amount DECIMAL(12, 2) NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'bank_transfer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BUDGETS
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  period TEXT CHECK (period IN ('monthly', 'weekly', 'daily', 'yearly')) DEFAULT 'monthly',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ADMIN HELPER FUNCTION
-- SECURITY DEFINER is vital here to prevent infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RLS POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Users Policies
CREATE POLICY "Users view own, Admins view all" ON public.users 
  FOR SELECT USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users update own" ON public.users 
  FOR UPDATE USING (auth.uid() = id);

-- Categories Policies
CREATE POLICY "Users view own, Admins view all" ON public.categories 
  FOR SELECT USING (auth.uid() = user_id OR is_admin());
  
CREATE POLICY "Users insert own, Admins insert for any" ON public.categories 
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin());
  
CREATE POLICY "Users update own, Admins update all" ON public.categories 
  FOR UPDATE USING (auth.uid() = user_id OR is_admin());
  
CREATE POLICY "Users delete own, Admins delete all" ON public.categories 
  FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- Transactions Policies
CREATE POLICY "Users view own, Admins view all" ON public.transactions 
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users insert own, Admins insert for any" ON public.transactions 
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users update own, Admins update all" ON public.transactions 
  FOR UPDATE USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users delete own, Admins delete all" ON public.transactions 
  FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- Budgets Policies
CREATE POLICY "Users view own, Admins view all" ON public.budgets 
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users insert own, Admins insert for any" ON public.budgets 
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users update own, Admins update all" ON public.budgets 
  FOR UPDATE USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users delete own, Admins delete all" ON public.budgets 
  FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- 5. TRIGGER FOR NEW USER (Consolidated Logic)
-- This function now creates the user profile AND the default categories
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- 1. Create the User Profile
  INSERT INTO public.users (id, email, name)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'name'
  );

  -- 2. Create Default Categories for the new user
  INSERT INTO public.categories (user_id, name, type, icon, color)
  VALUES 
    (new.id, 'Salary', 'income', '💼', '#4CAF50'),
    (new.id, 'Freelance', 'income', '🖥️', '#2196F3'),
    (new.id, 'Food', 'expense', '🍔', '#FF5722'),
    (new.id, 'Rent', 'expense', '🏠', '#9C27B0'),
    (new.id, 'Utilities', 'expense', '💡', '#FFC107'),
    (new.id, 'Entertainment', 'expense', '🎬', '#E91E63');

  RETURN new;
END;
$$;

-- 6. TRIGGER SETUP
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();