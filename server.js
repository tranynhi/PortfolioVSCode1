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
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Notion-Version'],
  credentials: true
}));

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

// Middleware to set MIME types
const setMimeType = (req, res, next) => {
  const ext = path.extname(req.path).toLowerCase();
  const mimeType = mimeTypes[ext];
  if (mimeType) {
    res.type(mimeType);
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
};

// Serve static files
app.use('/css', setMimeType, express.static(path.join(__dirname, 'public/css')));
app.use('/js', setMimeType, express.static(path.join(__dirname, 'public/js')));
app.use('/assets', setMimeType, express.static(path.join(__dirname, 'public/assets')));

// Serve HTML pages
app.use('/', express.static(path.join(__dirname, 'src/pages'), {
  index: ['index.html'],
  extensions: ['html']
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Handle post page route
app.get('/post/post.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/pages/post.html'));
});

// Serve component files
app.use('/components', express.static(path.join(__dirname, 'src/components')));

// Notion API proxy
app.all('/api/notion/*', async (req, res) => {
  try {
    // Get Notion API path and prepare URL
    const notionPath = req.params[0];
    const notionUrl = `https://api.notion.com/v1/${notionPath}`;

    // Get API key from environment variable
    const NOTION_API_KEY = process.env.NOTION_API_KEY;

    // Log request info
    console.log(`[Notion API] Request:`, {
      method: req.method,
      url: notionUrl,
      hasApiKey: !!NOTION_API_KEY
    });

    // Check API key
    if (!NOTION_API_KEY) {
      throw new Error('Notion API key is missing');
    }

    // Make request to Notion
    const response = await fetch(notionUrl, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined
    });

    // Get response data
    const contentType = response.headers.get('content-type');
    const data = contentType?.includes('application/json')
      ? await response.json()
      : await response.text();

    // Log response
    console.log(`[Notion API] Response:`, {
      status: response.status,
      ok: response.ok,
      contentType,
      data: typeof data === 'string' ? data.substring(0, 100) : data
    });

    // Handle error response
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Notion API Error',
        status: response.status,
        message: typeof data === 'object' ? data.message : data,
        notionRaw: data
      });
    }

    // Send success response
    res.json(data);

  } catch (error) {
    // Log error chi tiết
    console.error(`[Notion API] Error:`, {
      message: error.message,
      stack: error.stack,
      error
    });

    // Nếu có response từ Notion, trả về luôn response đó
    if (error.response) {
      const body = await error.response.text();
      return res.status(error.response.status).send(body);
    }

    // Trả về lỗi chi tiết cho client
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      stack: error.stack,
      raw: error
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