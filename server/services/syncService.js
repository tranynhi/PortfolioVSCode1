const { fetchNotionDatabase, renderNotionContent } = require('../js/notion');
const fs = require('fs').promises;
const path = require('path');

class NotionSyncService {
  constructor() {
    this.lastSyncTime = null;
    this.syncInterval = 30 * 1000; // 30 seconds
    this.lastProcessedPages = new Set();
  }

  async startSync() {
    console.log('Starting Notion sync service...');
    await this.syncContent();
    setInterval(() => this.syncContent(), this.syncInterval);
  }

  async syncContent() {
    try {
      console.log('Syncing content from Notion...');
      const database = await fetchNotionDatabase({
        filter: {
          property: "Status",
          status: {
            equals: "Published"
          }
        }
      });
      
      const currentPages = new Set();
      
      // Process each page in the database
      for (const page of database.results) {
        const pageId = page.id;
        currentPages.add(pageId);
        
        // Only process if page wasn't processed before or was updated
        const lastEditedTime = new Date(page.last_edited_time).getTime();
        if (!this.lastSyncTime || lastEditedTime > this.lastSyncTime) {
          await this.processPage(page);
        }
      }

      // Handle deleted pages
      for (const oldPageId of this.lastProcessedPages) {
        if (!currentPages.has(oldPageId)) {
          await this.handleDeletedPage(oldPageId);
        }
      }

      this.lastProcessedPages = currentPages;
      this.lastSyncTime = new Date();
      console.log('Sync completed at:', this.lastSyncTime);
    } catch (error) {
      console.error('Error during sync:', error);
    }
  }

  async processPage(page) {
    try {
      const pageId = page.id;
      const slug = page.properties.Slug?.rich_text[0]?.plain_text || '';
      
      // Get the page content
      const content = await renderNotionContent(pageId);
      
      // Create the content directory if it doesn't exist
      const contentDir = path.join(__dirname, '../../content/posts');
      await fs.mkdir(contentDir, { recursive: true });

      // Save the content to a file
      const filePath = path.join(contentDir, `${slug}.json`);
      await fs.writeFile(filePath, JSON.stringify({
        id: pageId,
        slug,
        content,
        lastUpdated: new Date().toISOString(),
        ...this.extractPageMetadata(page)
      }, null, 2));

      console.log(`Updated content file: ${slug}`);
    } catch (error) {
      console.error(`Error processing page: ${page.id}`, error);
    }
  }

  async handleDeletedPage(pageId) {
    try {
      const contentDir = path.join(__dirname, '../../content/posts');
      const files = await fs.readdir(contentDir);
      
      for (const file of files) {
        const filePath = path.join(contentDir, file);
        const content = JSON.parse(await fs.readFile(filePath, 'utf8'));
        
        if (content.id === pageId) {
          await fs.unlink(filePath);
          console.log(`Deleted content file: ${file}`);
          break;
        }
      }
    } catch (error) {
      console.error(`Error handling deleted page: ${pageId}`, error);
    }
  }

  extractPageMetadata(page) {
    return {
      title: page.properties.Title?.title[0]?.plain_text || '',
      description: page.properties.Description?.rich_text[0]?.plain_text || '',
      categories: page.properties.Category?.multi_select?.map(cat => cat.name) || [],
      coverImage: page.properties.Cover?.files[0]?.file?.url || '',
      publishDate: page.properties.PublishDate?.date?.start || '',
      lastEditedTime: page.last_edited_time
    };
  }
}

module.exports = new NotionSyncService(); 