const axios = require("axios");

// Configuration
const RCB_URL = process.env.RCB_URL || "https://www.bookmyshow.com/...";
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || "838511036:AAGJWiEn3VSWsIJtbe1k40jU02wi_UMAb1k";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "YOUR_CHAT_ID";

// Track state to avoid duplicate notifications
let lastState = "waiting";

async function notify(message) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message
    });
    console.log("✅ Notification sent!");
  } catch (err) {
    console.error("❌ Failed to send notification:", err.message);
  }
}

async function check() {
  try {
    console.log(`[${new Date().toLocaleTimeString()}] Checking for tickets...`);
    const res = await axios.get(RCB_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
      }
    });
    
    const html = res.data;
    
    // Check for ticket availability keywords
    if (html.includes("Book Now") || html.includes("Tickets Available")) {
      if (lastState !== "available") {
        console.log("🚨 TICKETS FOUND!!!");
        await notify("🚨 RCB TICKETS LIVE! OPEN NOW!!! 🚨\n\n" + RCB_URL);
        lastState = "available";
        process.exit(1); // Exit so GitHub Actions/system knows
      }
    } else {
      if (lastState !== "waiting") {
        console.log("Still waiting...");
      }
      lastState = "waiting";
    }
  } catch (err) {
    console.error("Error fetching page:", err.message);
  }
}

// Run immediately
check();
