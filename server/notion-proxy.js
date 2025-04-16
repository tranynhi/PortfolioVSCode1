require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Notion-Version'],
  credentials: true
}));

app.use(express.json());

app.all("/api/notion/*", async (req, res) => {
  try {
    const notionPath = req.params[0];
    const notionUrl = `https://api.notion.com/v1/${notionPath}`;
    
    const response = await axios({
      method: req.method,
      url: notionUrl,
      data: req.body,
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      }
    );
    console.log("✅ Proxy nhận được request từ FE:", req.body);

    res.json(response.data);
  } catch (err) {
    console.error("Notion API error:", err.response?.data || err);
    res.status(500).json({ error: "Failed to fetch Notion data" });
  }
});

console.log("Starting server...");
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
