-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (Modified for Roles)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  -- NEW: Role Column
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')), 
  currency TEXT DEFAULT 'USD',
  dark_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
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

-- 3. TRANSACTIONS TABLE
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

-- 4. BUDGETS TABLE
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

-- 5. ADMIN HELPER FUNCTION (Crucial for RLS)
-- This function checks if the logged-in user has the 'admin' role.
-- SECURITY DEFINER allows it to bypass RLS to read the role column safely.
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

-- 6. RLS POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
-- Users see own profile, Admins see all profiles
CREATE POLICY "Users view own, Admins view all" ON public.users 
  FOR SELECT USING (auth.uid() = id OR is_admin());

-- Only users can update their own specific fields (Admins usually handle this via dashboard logic, or you can add OR is_admin())
CREATE POLICY "Users update own" ON public.users 
  FOR UPDATE USING (auth.uid() = id);

-- CATEGORIES POLICIES
CREATE POLICY "Users view own, Admins view all" ON public.categories 
  FOR SELECT USING (auth.uid() = user_id OR is_admin());
  
CREATE POLICY "Users insert own, Admins insert for any" ON public.categories 
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin());
  
CREATE POLICY "Users update own, Admins update all" ON public.categories 
  FOR UPDATE USING (auth.uid() = user_id OR is_admin());
  
CREATE POLICY "Users delete own, Admins delete all" ON public.categories 
  FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- TRANSACTIONS POLICIES
CREATE POLICY "Users view own, Admins view all" ON public.transactions 
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users insert own, Admins insert for any" ON public.transactions 
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users update own, Admins update all" ON public.transactions 
  FOR UPDATE USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users delete own, Admins delete all" ON public.transactions 
  FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- BUDGETS POLICIES
CREATE POLICY "Users view own, Admins view all" ON public.budgets 
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users insert own, Admins insert for any" ON public.budgets 
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users update own, Admins update all" ON public.budgets 
  FOR UPDATE USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users delete own, Admins delete all" ON public.budgets 
  FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- 7. FUNCTION TO HANDLE NEW USER SIGNUP (Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the Profile (Role defaults to 'user' automatically)
  INSERT INTO public.users (id, email, name)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'name'
  );

  -- Insert Default Categories
  INSERT INTO public.categories (user_id, name, type, icon, color)
  VALUES 
    (new.id, 'Salary', 'income', 'wallet', '#10B981'),
    (new.id, 'Freelance', 'income', 'laptop', '#3B82F6'),
    (new.id, 'Food', 'expense', 'pizza', '#F59E0B'),
    (new.id, 'Rent', 'expense', 'home', '#EF4444'),
    (new.id, 'Transport', 'expense', 'car', '#6366F1'),
    (new.id, 'Entertainment', 'expense', 'game-controller', '#272124ff');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create the Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();