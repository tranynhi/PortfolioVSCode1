const { Client } = require('@notionhq/client');
const config = require('../config');

const notion = new Client({
  auth: config.NOTION_API_KEY,
});

async function fetchNotionDatabase(filterConfig = {}) {
  try {
    const response = await notion.databases.query({
      database_id: config.DATABASE_ID,
      ...filterConfig
    });
    return response;
  } catch (error) {
    console.error('Error fetching database:', error);
    throw error;
  }
}

async function fetchNotionPage(pageId) {
  try {
    const response = await notion.pages.retrieve({
      page_id: pageId
    });
    return response;
  } catch (error) {
    console.error('Error fetching page:', error);
    throw error;
  }
}

async function renderNotionContent(pageId) {
  try {
    const blocks = await notion.blocks.children.list({
      block_id: pageId
    });
    
    // Transform blocks to your desired format
    const content = blocks.results.map(block => {
      switch (block.type) {
        case 'paragraph':
          return {
            type: 'paragraph',
            content: block.paragraph.rich_text.map(text => text.plain_text).join('')
          };
        case 'heading_1':
          return {
            type: 'heading_1',
            content: block.heading_1.rich_text.map(text => text.plain_text).join('')
          };
        case 'heading_2':
          return {
            type: 'heading_2',
            content: block.heading_2.rich_text.map(text => text.plain_text).join('')
          };
        case 'heading_3':
          return {
            type: 'heading_3',
            content: block.heading_3.rich_text.map(text => text.plain_text).join('')
          };
        case 'bulleted_list_item':
          return {
            type: 'bullet_list',
            content: block.bulleted_list_item.rich_text.map(text => text.plain_text).join('')
          };
        case 'numbered_list_item':
          return {
            type: 'number_list',
            content: block.numbered_list_item.rich_text.map(text => text.plain_text).join('')
          };
        case 'image':
          return {
            type: 'image',
            url: block.image.file?.url || block.image.external?.url,
            caption: block.image.caption?.map(text => text.plain_text).join('') || ''
          };
        default:
          return null;
      }
    }).filter(Boolean);

    return content;
  } catch (error) {
    console.error('Error rendering content:', error);
    throw error;
  }
}

module.exports = {
  fetchNotionDatabase,
  fetchNotionPage,
  renderNotionContent
}; 