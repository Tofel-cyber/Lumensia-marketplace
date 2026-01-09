// api/incomplete-payments.js
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

    // Cek status payment
    const checkUrl = `${PI_BASE_URL}/payments/${paymentId}`;
    const checkResponse = await axios.get(checkUrl, config);
    const paymentStatus = checkResponse.data.status;

    if (paymentStatus === "approved") {
      // Jika approved tapi belum complete, coba complete
      const completeUrl = `${PI_BASE_URL}/payments/${paymentId}/complete`;
      const completeResponse = await axios.post(completeUrl, { txid: checkResponse.data.transaction?.txid }, config);
      console.log("Incomplete payment completed:", completeResponse.data);
      return res.status(200).json({ ok: true, action: "completed", payment: completeResponse.data });
    } else if (paymentStatus === "pending") {
      // Jika pending, approve dulu
      const approveUrl = `${PI_BASE_URL}/payments/${paymentId}/approve`;
      const approveResponse = await axios.post(approveUrl, {}, config);
      console.log("Incomplete payment approved:", approveResponse.data);
      return res.status(200).json({ ok: true, action: "approved", payment: approveResponse.data });
    } else {
      // Status lain (completed, cancelled, failed), tidak perlu action
      console.log(`Payment ${paymentId} status: ${paymentStatus}, no action needed`);
      return res.status(200).json({ ok: true, action: "none", status: paymentStatus });
    }
  } catch (err) {
    console.error("Incomplete payment error:", err.response?.data || err.message);
    return res
      .status(500)
      .json({ error: "Failed to handle incomplete payment", detail: err.response?.data || err.message });
  }
};