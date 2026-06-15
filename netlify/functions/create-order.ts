import Razorpay from "razorpay";
import { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { amount, receipt } = JSON.parse(event.body || "{}");
    if (!amount) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Amount is required" }),
      };
    }

    const key_id = process.env.VITE_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (
      !key_id ||
      !key_secret ||
      key_id === "YOUR_RAZORPAY_KEY_ID_HERE" ||
      key_secret === "YOUR_RAZORPAY_KEY_SECRET_HERE"
    ) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `order_mock_${Date.now()}`,
          amount: amount * 100,
          currency: "INR",
          receipt: receipt || `receipt_${Date.now()}`,
          status: "created",
          mock: true,
        }),
      };
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: receipt || `receipt_${Date.now()}`,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...order,
        key_id,
      }),
    };
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal Server Error" }),
    };
  }
};
