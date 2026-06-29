-- Add new columns to profiles table if they don't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auth_provider text;

-- Update the handle_new_user function to capture and store these fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role text;
  user_avatar text;
  provider_name text;
BEGIN
  user_role := lower(coalesce(new.raw_user_meta_data->>'role', 'patient'));
  IF user_role = 'admin' THEN
    user_role := 'hospital_admin';
  END IF;

  -- Extract avatar URL from user_metadata
  user_avatar := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture',
    new.raw_user_meta_data->>'avatar',
    ''
  );

  -- Extract auth provider from raw_app_meta_data or raw_user_meta_data
  provider_name := coalesce(
    new.raw_app_meta_data->>'provider',
    new.raw_user_meta_data->>'iss',
    'email'
  );
  -- Check if it contains google, and set it properly
  IF provider_name LIKE '%google%' THEN
    provider_name := 'google';
  END IF;

  INSERT INTO public.profiles (id, full_name, role, phone, email, avatar_url, auth_provider)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', ''),
    user_role,
    coalesce(new.raw_user_meta_data->>'phone', ''),
    new.email,
    user_avatar,
    provider_name
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_user_update function to keep these columns synchronized if user meta metadata updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger AS $$
DECLARE
  user_role text;
  user_avatar text;
  provider_name text;
BEGIN
  user_role := lower(coalesce(new.raw_user_meta_data->>'role', 'patient'));
  IF user_role = 'admin' THEN
    user_role := 'hospital_admin';
  END IF;

  -- Extract avatar URL from user_metadata
  user_avatar := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture',
    new.raw_user_meta_data->>'avatar'
  );

  -- Extract auth provider
  provider_name := coalesce(
    new.raw_app_meta_data->>'provider',
    new.raw_user_meta_data->>'iss'
  );
  IF provider_name LIKE '%google%' THEN
    provider_name := 'google';
  END IF;

  UPDATE public.profiles
  SET 
    full_name = coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', full_name),
    phone = coalesce(new.raw_user_meta_data->>'phone', phone),
    role = user_role,
    email = coalesce(new.email, email),
    avatar_url = coalesce(user_avatar, avatar_url),
    auth_provider = coalesce(provider_name, auth_provider)
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check and create policy for INSERT on public.profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Allow authenticated users to insert their own profile'
  ) THEN
    CREATE POLICY "Allow authenticated users to insert their own profile" 
      ON public.profiles FOR INSERT 
      WITH CHECK (auth.uid() = id);
  END IF;
END
$$;
