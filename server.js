import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Set security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

app.use(express.json());

// Health check endpoint for UptimeRobot
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Serve static files with correct MIME types
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve CSS files with proper MIME type
app.use('/css', express.static(path.join(__dirname, 'src/styles'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Serve JavaScript files with proper MIME type
app.use('/js', express.static(path.join(__dirname, 'src/js'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Serve JavaScript API files
app.use('/js/api', express.static(path.join(__dirname, 'src/js/api')));

// Serve JavaScript utils files
app.use('/js/utils', express.static(path.join(__dirname, 'src/js/utils')));

// Serve JavaScript pages files
app.use('/js/pages', express.static(path.join(__dirname, 'src/js/pages')));

// Serve HTML pages
app.use('/', express.static(path.join(__dirname, 'src/pages')));

// Handle post page route
app.get('/post/post.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/pages/post.html'));
});

// Serve component files
app.use('/components', express.static(path.join(__dirname, 'src/components')));

// Proxy endpoint for Notion API
app.all('/api/notion/*', async (req, res) => {
  try {
    const notionPath = req.params[0];
    console.log('Notion API request:', {
      path: notionPath,
      method: req.method
    });

    const notionUrl = `https://api.notion.com/v1/${notionPath}`;
    const response = await fetch(notionUrl, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Notion API Error:', {
        status: response.status,
        data
      });
      return res.status(response.status).json(data);
    }

    console.log('Notion API Success:', {
      path: notionPath,
      status: response.status
    });

    res.json(data);
  } catch (error) {
    console.error('Notion API Error:', error);
    res.status(500).json({
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

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});