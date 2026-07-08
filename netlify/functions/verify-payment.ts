import crypto from "crypto";
import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      plan,
      subscription_start,
      subscription_end,
      token,
    } = JSON.parse(event.body || "{}");

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !plan) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Required fields missing" }),
      };
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    let verified = false;

    // Check for mock payments
    if (razorpay_order_id.startsWith("order_mock_") || !key_secret || key_secret === "YOUR_RAZORPAY_KEY_SECRET_HERE") {
      if (razorpay_signature === "mock_signature" || razorpay_order_id.startsWith("order_mock_")) {
        verified = true;
      }
    } else {
      const generated_signature = crypto
        .createHmac("sha256", key_secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      verified = generated_signature === razorpay_signature;
    }

    if (!verified) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Signature verification failed", verified: false }),
      };
    }

    // Initialize Supabase Client
    const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://wialpeheyvjdsmfcwuvn.supabase.co";
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

    if (!supabaseAnonKey) {
      console.warn("Supabase Key is missing in Netlify environment variables.");
    }

    // Instantiate client using the user's session JWT token to bypass or respect RLS policies
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    });

    // Update user profile plan details in profiles table
    // We try to update, if columns don't exist yet, we log it and continue
    const { data: updatedProfile, error: dbError } = await supabase
      .from("profiles")
      .update({
        plan: plan,
        subscription_status: "active",
        subscription_start: subscription_start || new Date().toISOString(),
        subscription_end: subscription_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        razorpay_payment_id: razorpay_payment_id,
        razorpay_order_id: razorpay_order_id,
      })
      .eq("id", userId)
      .select();

    if (dbError) {
      console.error("Supabase Database Update Error:", dbError);
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "success",
          verified: true,
          dbUpdated: false,
          error: dbError.message,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "success",
        verified: true,
        dbUpdated: true,
        profile: updatedProfile,
      }),
    };
  } catch (error: any) {
    console.error("Error verifying payment signature:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal Server Error" }),
    };
  }
};
