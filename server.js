import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());

// Enable CORS
app.use(cors());

// Set strict MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, filePath) => {
    // Set nosniff header
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Set correct MIME type
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = mimeTypes[ext];
    if (mimeType) {
      res.setHeader('Content-Type', mimeType);
    }
  }
}));

// Serve HTML pages
app.use(express.static(path.join(__dirname, 'src/pages'), {
  setHeaders: (res) => {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Serve HTML pages
app.use('/', express.static(path.join(__dirname, 'src/pages')));

// Handle post page route
app.get('/post/post.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/pages/post.html'));
});

// Serve component files
app.use('/components', express.static(path.join(__dirname, 'src/components')));

// Notion API proxy
app.all('/api/notion/*', async (req, res) => {
  try {
    // Get Notion API path
    const notionPath = req.params[0];
    const notionUrl = `https://api.notion.com/v1/${notionPath}`;

    // Log request
    console.log(`[Notion API] ${req.method} ${notionUrl}`);

    // Make request
    const response = await fetch(notionUrl, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });

    // Parse response
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = await response.text();
    }

    // Log response
    console.log(`[Notion API] Response:`, {
      status: response.status,
      ok: response.ok,
      type: typeof data
    });

    // Handle error
    if (!response.ok) {
      throw new Error(JSON.stringify({
        status: response.status,
        data: data
      }));
    }

    // Send response
    res.json(data);

  } catch (error) {
    // Log error
    console.error(`[Notion API] Error:`, error);

    // Parse error
    let errorData;
    try {
      errorData = JSON.parse(error.message);
    } catch (e) {
      errorData = {
        status: 500,
        data: { message: error.message }
      };
    }

    // Send error response
    res.status(errorData.status).json(errorData.data);
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