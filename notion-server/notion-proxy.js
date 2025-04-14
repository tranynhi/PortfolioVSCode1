require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors({
  origin: "http://127.0.0.1:64216", // ✅ Ghi rõ origin bạn dùng live-server
  credentials: false
}));

app.use(express.json());

app.post("/api/notion", async (req, res) => {
  try {
    const response = await axios.post(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`,
      req.body,
      {
        headers: {
          "Authorization": `Bearer ${process.env.NOTION_API_KEY}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json"
        }
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error("Notion API error:", err.response?.data || err);
    res.status(500).json({ error: "Failed to fetch Notion data" });
  }
});

console.log("Starting server...");
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
