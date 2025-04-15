import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// CORS and JSON middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Notion-Version'],
  credentials: true
}));
app.use(express.json());

// Serve static files
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/post', express.static(path.join(__dirname, 'post')));

// Proxy endpoint for Notion API
app.all('/api/notion/*', async (req, res) => {
  try {
    const notionPath = req.path.replace('/api/notion', '');
    const notionUrl = `https://api.notion.com/v1${notionPath}`;
    
    console.log('Proxying request to Notion:', {
      url: notionUrl,
      method: req.method,
      body: req.body
    });

    const response = await fetch(notionUrl, {
      method: req.method,
      headers: {
        'Authorization': `Bearer secret_Ue8Ue6Ue8Ue6Ue8Ue6Ue8Ue6Ue8Ue6Ue8U`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      ...(req.method !== 'GET' && { body: JSON.stringify(req.body) })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Notion API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: notionUrl,
        data
      });
      return res.status(response.status).json(data);
    }

    console.log('Notion API Success:', {
      url: notionUrl,
      status: response.status,
      hasData: !!data
    });

    res.json(data);
  } catch (error) {
    console.error('Error proxying to Notion:', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to fetch from Notion API',
      details: error.message 
    });
  }
});

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve post.html for /post/post.html path
app.get('/post/post.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'post/post.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});