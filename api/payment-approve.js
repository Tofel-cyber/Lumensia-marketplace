// api/payment-approve.js
const axios = require("axios");

const PI_BASE_URL = "https://sandbox-api.minepi.com/v2";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: "paymentId is required" });
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

    // **TAMBAHAN**: Cek status payment dulu sebelum approve
    const checkUrl = `${PI_BASE_URL}/payments/${paymentId}`;
    const checkResponse = await axios.get(checkUrl, config);
    const paymentStatus = checkResponse.data.status;

    if (paymentStatus !== "pending") {
      console.log(`Payment ${paymentId} status: ${paymentStatus}, cannot approve`);
      return res.status(400).json({ error: `Payment status is ${paymentStatus}, cannot approve` });
    }

    // Approve payment
    const approveUrl = `${PI_BASE_URL}/payments/${paymentId}/approve`;
    const response = await axios.post(approveUrl, {}, config);

    // Simpan status ke database jika perlu (misal update order status ke "approved")
    console.log("Payment approved:", response.data);

    return res.status(200).json({ ok: true, payment: response.data });
  } catch (err) {
    console.error("Approve error:", err.response?.data || err.message);
    return res
      .status(500)
      .json({ error: "Approve failed", detail: err.response?.data || err.message });
  }
};