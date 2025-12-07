// api/payment-complete.js
const axios = require("axios");

const PI_BASE_URL = "https://api.minepi.com/v2";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { paymentId, txid } = req.body;

    if (!paymentId || !txid) {
      return res.status(400).json({ error: "paymentId and txid are required" });
    }

    const apiKey = process.env.PI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "PI_API_KEY not configured" });
    }

    const config = {
      headers: {
        Authorization: `Key ${apiKey}`,
        "Content-Type": "application/json"
      }
    };

    const url = `${PI_BASE_URL}/payments/${paymentId}/complete`;

    const response = await axios.post(url, { txid }, config);

    // Di sini kamu bisa tandai order sebagai "paid & delivered" di database
    console.log("Payment completed:", response.data);

    return res.status(200).json({ ok: true, payment: response.data });
  } catch (err) {
    console.error("Complete error:", err.response?.data || err.message);
    return res
      .status(500)
      .json({ error: "Complete failed", detail: err.response?.data || err.message });
  }
};
