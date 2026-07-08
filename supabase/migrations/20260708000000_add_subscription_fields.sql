-- Add subscription columns to profiles table if they don't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan text DEFAULT 'Free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_start timestamp with time zone;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_end timestamp with time zone;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS razorpay_payment_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS razorpay_order_id text;

-- Check and create policy for SELECT/UPDATE on public.profiles if they don't exist
-- Usually, authenticated users should be able to read all profiles, but only update their own.
-- Allow users to update their own subscription status (since it's done client-side after payment verification)
CREATE POLICY "Allow users to update their own profile subscription"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
