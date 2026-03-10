# Supabase Integration Setup

This project now uses Supabase for authentication and will use it for data management.

## 1. Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from your Supabase dashboard → Project Settings → API.

## 2. Supabase Database Setup

### Create Users Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create a custom users table to extend auth.users
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL,
  name text,
  role text DEFAULT 'editor' CHECK ((role IN ('admin', 'editor', 'viewer'))),
  avatar_url text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Set up RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Create policy to insert new user data
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create trigger to sync auth.users with public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'editor')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger after user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## 3. Authentication Flow

The app now supports:

- **Login**: Uses Supabase `signInWithPassword`
- **Register**: Uses Supabase `signUp` with user metadata
- **Session Persistence**: Automatic session restoration on page load
- **Route Protection**: Middleware protects `/dashboard` routes

## 4. Features Implemented

✅ Supabase client setup (browser & server)
✅ Updated User type for Supabase compatibility  
✅ Auth store with session persistence
✅ Auth service with Supabase methods
✅ Login & register pages updated
✅ Auth provider for session management
✅ Middleware for route protection

## 5. Usage

1. **Register**: New users are created in Supabase Auth and users table
2. **Login**: Validates credentials against Supabase Auth
3. **Session**: Automatically restored on app load
4. **Logout**: Clears Supabase session and redirects to login

## 6. Testing

- Visit `/login` or `/register` 
- Use real email/password (no more mock accounts)
- Session persists across page refreshes
- Protected routes redirect to login if not authenticated

## 7. Next Steps

- Create other tables (kajian, events, etc.) in Supabase
- Update service files to use Supabase instead of mock data
- Add file upload for avatars using Supabase Storage
