import express from "express";
import fetch from "node-fetch";
import handler from "./api/votes.js";

const app = express();

// Convert Express req/res to mimic Vercel handler
app.get("/api/votes", async (req, res) => {
  try {
    // Convert query params and headers
    const vercelReq = {
      query: req.query,
      headers: req.headers
    };

    // Call your original handler
    await handler(vercelReq, res);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Server running on port ${port}`));
