const crypto = require("crypto");

export default async function handler(req, res) {
  try {
    const data = req.body || req.query || {};

    const salt = process.env.PAYU_SALT;

    if (!salt) {
      return res.status(500).send("PayU Salt is not configured.");
    }

    const {
      status = "",
      txnid = "",
      amount = "",
      firstname = "",
      email = "",
      productinfo = "",
      key = "",
      hash = "",
      udf1 = "",
      udf2 = "",
      udf3 = "",
      udf4 = "",
      udf5 = "",
    } = data;

    // Required response fields
    if (!status || !txnid || !amount || !productinfo || !firstname || !email || !key || !hash) {
      return res.status(400).send("Invalid PayU response.");
    }

    /*
      PayU Reverse Hash

      SHA512(
        SALT|status||||||
        udf5|udf4|udf3|udf2|udf1|
        email|firstname|productinfo|amount|txnid|key
      )
    */

    const reverseHashString =
      `${salt}|${status}||||||` +
      `${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|` +
      `${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;

    const calculatedHash = crypto
      .createHash("sha512")
      .update(reverseHashString)
      .digest("hex");

    // Security check
    if (calculatedHash.toLowerCase() !== hash.toLowerCase()) {
      console.error("PayU response hash mismatch");

      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Payment Verification Failed</title>

          <style>
            body {
              margin: 0;
              background: #0c0908;
              color: #f2efec;
              font-family: Arial, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              text-align: center;
            }

            .box {
              width: 90%;
              max-width: 500px;
              padding: 40px 25px;
              background: #161010;
              border-radius: 20px;
              border: 1px solid rgba(217,217,217,.15);
            }

            .cross {
              font-size: 60px;
              color: #dd0200;
            }

            p {
              color: #aaa;
              line-height: 1.6;
            }

            .btn {
              display: inline-block;
              margin-top: 20px;
              padding: 14px 25px;
              background: #dd0200;
              color: white;
              text-decoration: none;
              border-radius: 10px;
              font-weight: bold;
            }
          </style>
        </head>

        <body>
          <div class="box">
            <div class="cross">×</div>

            <h1>Payment Verification Failed</h1>

            <p>
              We could not verify this payment response.
            </p>

            <p>
              Please contact support if money has been deducted.
            </p>

            <a class="btn" href="https://www.siaxfold.store">
              Back to SIAX FOLD
            </a>
          </div>
        </body>
        </html>
      `);
    }

    // Only show success after hash verification
    if (status === "success") {
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Payment Successful</title>

          <style>
            body {
              margin: 0;
              background: #0c0908;
              color: #f2efec;
              font-family: Arial, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              text-align: center;
            }

            .box {
              width: 90%;
              max-width: 500px;
              padding: 40px 25px;
              background: #161010;
              border: 1px solid rgba(217,217,217,.15);
              border-radius: 20px;
            }

            .check {
              font-size: 60px;
              color: #22c55e;
              margin-bottom: 15px;
            }

            h1 {
              margin-bottom: 10px;
            }

            p {
              color: #aaa;
              line-height: 1.6;
            }

            .btn {
              display: inline-block;
              margin-top: 20px;
              padding: 14px 25px;
              background: #dd0200;
              color: white;
              text-decoration: none;
              border-radius: 10px;
              font-weight: bold;
            }
          </style>
        </head>

        <body>
          <div class="box">

            <div class="check">✓</div>

            <h1>Payment Successful</h1>

            <p>
              Thank you ${firstname || "for your order"}.
            </p>

            <p>
              Your SIAX FOLD order has been received successfully.
            </p>

            <p>
              Transaction ID:<br>
              <strong>${txnid}</strong>
            </p>

            <p>
              Amount Paid: ₹${amount}
            </p>

            <a class="btn" href="https://www.siaxfold.store">
              Back to SIAX FOLD
            </a>

          </div>
        </body>
        </html>
      `);
    }

    // Failed / pending / other status
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Payment Failed</title>

        <style>
          body {
            margin: 0;
            background: #0c0908;
            color: #f2efec;
            font-family: Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            text-align: center;
          }

          .box {
            width: 90%;
            max-width: 500px;
            padding: 40px 25px;
            background: #161010;
            border-radius: 20px;
            border: 1px solid rgba(217,217,217,.15);
          }

          .cross {
            font-size: 60px;
            color: #dd0200;
          }

          p {
            color: #aaa;
            line-height: 1.6;
          }

          .btn {
            display: inline-block;
            margin-top: 20px;
            padding: 14px 25px;
            background: #dd0200;
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-weight: bold;
          }
        </style>
      </head>

      <body>
        <div class="box">

          <div class="cross">×</div>

          <h1>Payment Failed</h1>

          <p>
            Your payment could not be completed.
          </p>

          <p>
            Please try again.
          </p>

          <a class="btn" href="https://www.siaxfold.store">
            Try Again
          </a>

        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error("PayU Response Error:", error);

    return res.status(500).send("Payment response processing failed.");
  }
}
