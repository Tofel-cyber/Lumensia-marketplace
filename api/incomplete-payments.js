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
    const payment = checkResponse.data;
    const paymentStatus = payment.status;

    console.log(`Incomplete payment ${paymentId} status: ${paymentStatus}`);

    if (paymentStatus === "approved") {
      // Jika approved tapi belum complete, coba complete
      const txid = payment.transaction?.txid;
      
      if (!txid) {
        console.error("No txid found for approved payment:", paymentId);
        return res.status(400).json({ 
          error: "Payment approved but no txid available", 
          paymentId 
        });
      }

      const completeUrl = `${PI_BASE_URL}/payments/${paymentId}/complete`;
      const completeResponse = await axios.post(completeUrl, { txid }, config);
      
      console.log("✅ Incomplete payment completed:", completeResponse.data);
      return res.status(200).json({ 
        ok: true, 
        action: "completed", 
        payment: completeResponse.data 
      });
      
    } else if (paymentStatus === "pending") {
      // Jika pending, approve dulu
      const approveUrl = `${PI_BASE_URL}/payments/${paymentId}/approve`;
      const approveResponse = await axios.post(approveUrl, {}, config);
      
      console.log("✅ Incomplete payment approved:", approveResponse.data);
      return res.status(200).json({ 
        ok: true, 
        action: "approved", 
        payment: approveResponse.data 
      });
      
    } else if (paymentStatus === "completed") {
      // Already completed, just return success
      console.log("ℹ️ Payment already completed:", paymentId);
      return res.status(200).json({ 
        ok: true, 
        action: "already_completed", 
        status: paymentStatus 
      });
      
    } else {
      // Status lain (cancelled, failed), cancel atau log saja
      console.log(`ℹ️ Payment ${paymentId} status: ${paymentStatus}, no action needed`);
      return res.status(200).json({ 
        ok: true, 
        action: "none", 
        status: paymentStatus 
      });
    }
    
  } catch (err) {
    console.error("❌ Incomplete payment error:", err.response?.data || err.message);
    return res.status(500).json({ 
      error: "Failed to handle incomplete payment", 
      detail: err.response?.data || err.message 
    });
  }
};