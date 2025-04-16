const express = require('express');
const dotenv = require('dotenv');
const notionWebhook = require('./webhooks/notionWebhook');
const syncService = require('./services/syncService');
const cors = require('cors');
const { NOTION_API_KEY, DATABASE_ID } = require('./config');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://*.github.io', 'https://*.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Notion-Version'],
  credentials: true
}));

// Security middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Routes
app.use('/api/webhooks', notionWebhook);

// Notion API proxy endpoints
app.get('/api/notion/pages/:pageId', async (req, res) => {
  try {
    const response = await fetch(`https://api.notion.com/v1/pages/${req.params.pageId}`, {
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28'
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
});

app.post('/api/notion/databases/:databaseId/query', async (req, res) => {
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${req.params.databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error querying database:', error);
    res.status(500).json({ error: 'Failed to query database' });
  }
});

app.get('/api/notion/blocks/:blockId/children', async (req, res) => {
  try {
    const response = await fetch(`https://api.notion.com/v1/blocks/${req.params.blockId}/children`, {
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28'
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching block children:', error);
    res.status(500).json({ error: 'Failed to fetch block children' });
  }
});

// Start sync service
syncService.startSync();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});