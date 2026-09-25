const crypto = require("crypto");

export default async function handler(req, res) {
  // Only POST requests allowed
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const {
      firstname,
      email,
      phone,
      address,
      city,
      state,
      zipcode,
    } = req.body || {};

    // Basic validation
    if (!firstname || !email || !phone) {
      return res.status(400).json({
        error: "Name, email and phone are required.",
      });
    }

    // PayU credentials from Vercel Environment Variables
    const key = process.env.PAYU_KEY;
    const salt = process.env.PAYU_SALT;

    if (!key || !salt) {
      return res.status(500).json({
        error: "PayU credentials are not configured.",
      });
    }

    // Fixed product price
    const amount = "1599.00";
    const productinfo = "SIAX FOLD Wireless Earbuds";

    // Generate unique transaction ID
    const txnid =
      "SIAX" +
      Date.now().toString() +
      Math.floor(Math.random() * 1000);

    /*
      PayU Hosted Checkout Hash

      key|txnid|amount|productinfo|firstname|email|
      udf1|udf2|udf3|udf4|udf5||||||SALT
    */

    const udf1 = "";
    const udf2 = "";
    const udf3 = "";
    const udf4 = "";
    const udf5 = "";

    const hashString =
      `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|` +
      `${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;

    const hash = crypto
      .createHash("sha512")
      .update(hashString)
      .digest("hex");

    // Your Vercel website URL
    const baseUrl = "https://www.siaxfold.store";

    const paymentData = {
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone,

      // Customer address
      address1: address || "",
      city: city || "",
      state: state || "",
      zipcode: zipcode || "",
      country: "India",

      // Hash
      hash,

      // Payment method options
      service_provider: "payu_paisa",

      // PayU redirects
      surl: `${baseUrl}/api/payment-response`,
      furl: `${baseUrl}/api/payment-response`,
      curl: `${baseUrl}/api/payment-response`,

      // UDF fields
      udf1,
      udf2,
      udf3,
      udf4,
      udf5,
    };

    return res.status(200).json({
      success: true,
      paymentUrl: "https://secure.payu.in/_payment",
      data: paymentData,
    });
  } catch (error) {
    console.error("PayU Create Payment Error:", error);

    return res.status(500).json({
      error: "Unable to create payment.",
    });
  }
}
