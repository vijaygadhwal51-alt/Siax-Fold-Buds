export default async function handler(req, res) {
  const data = req.body || req.query || {};

  const status = data.status;
  const txnid = data.txnid || "";
  const amount = data.amount || "";
  const firstname = data.firstname || "";
  const email = data.email || "";

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
}
