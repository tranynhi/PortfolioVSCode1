require('dotenv').config();

const config = {
  NOTION_API_KEY: process.env.NOTION_API_KEY,
  DATABASE_ID: process.env.NOTION_DATABASE_ID,
  NOTION_SIGNING_SECRET: process.env.NOTION_SIGNING_SECRET,
  PORT: process.env.PORT || 3000,
  
  // Webhook URL will be updated when ngrok starts
  WEBHOOK_URL: process.env.WEBHOOK_URL || 'http://localhost:3000',
  
  // Development mode by default
  isDevelopment: process.env.NODE_ENV !== 'production'
};

module.exports = config; 