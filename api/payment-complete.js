// api/payment-complete.js
const axios = require("axios");

const PI_BASE_URL = "https://api.minepi.com/v2"; // Ganti ke https://sandbox-api.minepi.com/v2 jika testnet

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

    // **TAMBAHAN**: Cek status payment dulu sebelum complete
    const checkUrl = `${PI_BASE_URL}/payments/${paymentId}`;
    const checkResponse = await axios.get(checkUrl, config);
    const paymentStatus = checkResponse.data.status;

    if (paymentStatus !== "approved") {
      console.log(`Payment ${paymentId} status: ${paymentStatus}, cannot complete`);
      return res.status(400).json({ error: `Payment status is ${paymentStatus}, cannot complete` });
    }

    // Complete payment
    const completeUrl = `${PI_BASE_URL}/payments/${paymentId}/complete`;
    const response = await axios.post(completeUrl, { txid }, config);

    // Simpan status ke database (misal update order ke "paid & delivered")
    console.log("Payment completed:", response.data);

    return res.status(200).json({ ok: true, payment: response.data });
  } catch (err) {
    console.error("Complete error:", err.response?.data || err.message);
    return res
      .status(500)
      .json({ error: "Complete failed", detail: err.response?.data || err.message });
  }
};