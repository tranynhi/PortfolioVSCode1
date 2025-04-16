const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Your Notion signing secret from the integration settings
const NOTION_SIGNING_SECRET = process.env.NOTION_SIGNING_SECRET;

// Verify that the request is from Notion
function verifyNotionRequest(req) {
  if (!NOTION_SIGNING_SECRET) {
    console.error('NOTION_SIGNING_SECRET is not set');
    return false;
  }

  const timestamp = req.header('x-notion-timestamp');
  const signature = req.header('x-notion-signature');
  const body = JSON.stringify(req.body);

  const signatureToVerify = crypto
    .createHmac('sha256', NOTION_SIGNING_SECRET)
    .update(timestamp + body)
    .digest('hex');

  return signatureToVerify === signature;
}

// Handle Notion webhook
router.post('/notion-webhook', async (req, res) => {
  try {
    // Verify the request is from Notion
    if (!verifyNotionRequest(req)) {
      console.error('Invalid request signature');
      return res.status(401).json({ error: 'Invalid request signature' });
    }

    const { type, payload } = req.body;

    // Handle different webhook events
    switch (type) {
      case 'page.update':
        await handlePageUpdate(payload);
        break;
      case 'page.create':
        await handlePageCreate(payload);
        break;
      case 'page.delete':
        await handlePageDelete(payload);
        break;
      default:
        console.log('Unhandled webhook type:', type);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle page update events
async function handlePageUpdate(payload) {
  try {
    const pageId = payload.page.id;
    // Fetch the updated page content and update the website
    const { fetchNotionPage, renderNotionContent } = require('../js/notion');
    const pageData = await fetchNotionPage(pageId);
    const content = await renderNotionContent(pageId);
    
    // Update the website content
    // This will depend on your website's structure
    console.log('Page updated:', pageId);
    console.log('New content:', content);
    
    // TODO: Implement your website update logic here
  } catch (error) {
    console.error('Error handling page update:', error);
    throw error;
  }
}

// Handle page create events
async function handlePageCreate(payload) {
  try {
    const pageId = payload.page.id;
    // Similar to update, but for new pages
    console.log('New page created:', pageId);
    // TODO: Implement your new page creation logic
  } catch (error) {
    console.error('Error handling page create:', error);
    throw error;
  }
}

// Handle page delete events
async function handlePageDelete(payload) {
  try {
    const pageId = payload.page.id;
    console.log('Page deleted:', pageId);
    // TODO: Implement your page deletion logic
  } catch (error) {
    console.error('Error handling page delete:', error);
    throw error;
  }
}

module.exports = router; 