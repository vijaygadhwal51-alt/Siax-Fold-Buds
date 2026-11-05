// Vercel serverless function: /api/verify-payment?order_id=xxx
// Payment ke baad asli status yahin se check hota hai (browser par bharosa mat karo).

const BASE_URL =
  process.env.CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

export default async function handler(req, res) {
  const { order_id } = req.query;

  if (!order_id) {
    return res.status(400).json({ error: "order_id missing hai" });
  }

  try {
    const response = await fetch(`${BASE_URL}/orders/${encodeURIComponent(order_id)}`, {
      headers: {
        Accept: "application/json",
        "x-api-version": "2025-01-01",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || "Order nahi mila" });
    }

    return res.status(200).json({
      order_id: data.order_id,
      amount: data.order_amount,
      status: data.order_status, // "PAID" matlab payment successful
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
