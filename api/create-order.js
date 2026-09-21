export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({
        error: "Razorpay API keys are not configured"
      });
    }

    const auth = Buffer.from(
      `${keyId}:${keySecret}`
    ).toString("base64");

    const razorpayResponse = await fetch(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${auth}`
        },
        body: JSON.stringify({
          amount: 159900,
          currency: "INR",
          receipt: `siax_${Date.now()}`,
          notes: {
            product: "SIAX FOLDBUDS"
          }
        })
      }
    );

    const data = await razorpayResponse.json();

    return res.status(razorpayResponse.status).json(data);

  } catch (error) {
    console.error("Razorpay order error:", error);

    return res.status(500).json({
      error: "Unable to create Razorpay order"
    });
  }
}
