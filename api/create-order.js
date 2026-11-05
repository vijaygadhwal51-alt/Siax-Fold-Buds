// Vercel function: /api/create-order  (SIAX FOLD × Cashfree)
// Price server par dobara calculate hota hai, taaki koi browser me amount badal kar sasta order na bana sake.
// Price ya coupon badlo to index.html ke saath yahan bhi badalna.

const PRODUCTS = {
  "fold-alabaster": { name: "SIAX FOLD — Alabaster Silver", price: 1599 },
  "fold-gunmetal":  { name: "SIAX FOLD — Gunmetal",        price: 1599 },
  "fold-coffee":    { name: "SIAX FOLD — Coffee Bean",     price: 1599 },
};
const OFFER = { enabled: true, code: "SIAX100", off: 100 };

const IS_LIVE = process.env.CASHFREE_ENV === "production";
const BASE_URL = IS_LIVE ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";

const clean = (v, max = 200) => String(v ?? "").replace(/[\r\n\t]/g, " ").trim().slice(0, max);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const b = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const phone = String(b.phone || "").replace(/\D/g, "");
    const zip = String(b.zipcode || "").replace(/\D/g, "");
    const name = clean(b.firstname, 100);
    const email = clean(b.email, 100);

    if (!/^[0-9]{10}$/.test(phone)) return res.status(400).json({ error: "Please enter a valid 10-digit mobile number." });
    if (!/^[0-9]{6}$/.test(zip)) return res.status(400).json({ error: "Please enter a valid 6-digit PIN code." });
    if (!name || !email) return res.status(400).json({ error: "Please fill all required details." });

    // Server-side total
    let subtotal = 0;
    const lines = [];
    for (const it of Array.isArray(b.items) ? b.items : []) {
      const p = PRODUCTS[it.id];
      const qty = Math.min(Math.max(parseInt(it.qty, 10) || 0, 0), 10);
      if (!p || !qty) continue;
      subtotal += p.price * qty;
      lines.push(`${p.name} x${qty}`);
    }
    if (!subtotal) return res.status(400).json({ error: "Your cart is empty." });
    const discount = OFFER.enabled && b.coupon === OFFER.code ? Math.min(OFFER.off, subtotal) : 0;
    const amount = subtotal - discount;

    const orderId = "SIAX" + Date.now() + Math.floor(Math.random() * 900 + 100);
    const site = `https://${req.headers["x-forwarded-host"] || req.headers.host}`;

    const r = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-version": "2025-01-01",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: "cust_" + phone,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
        },
        order_meta: {
          return_url: `${site}/?order_id={order_id}#/order-success`,
        },
        order_note: clean(lines.join(", ") + (discount ? ` | Coupon ${OFFER.code}` : ""), 200),
        // Delivery address Cashfree dashboard me order ke saath dikhega
        order_tags: {
          address: clean(b.address, 200),
          city: clean(b.city, 60),
          state: clean(b.state, 60),
          pincode: zip,
        },
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      console.error("Cashfree create order failed:", data);
      return res.status(502).json({ error: data.message || "Payment could not be started. Please try again." });
    }

    return res.status(200).json({
      order_id: data.order_id,
      payment_session_id: data.payment_session_id,
      amount,
      mode: IS_LIVE ? "production" : "sandbox",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Payment could not be started. Please try again." });
  }
}
