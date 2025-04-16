// Notion API configuration
// Use the server domain for API endpoint
const API_ENDPOINT = 'https://tranynhi.onrender.com/api/notion';

// These values will be provided by the server through environment variables
const DATABASE_ID = process.env.NOTION_DATABASE_ID;
const NOTION_API_KEY = process.env.NOTION_API_KEY;

// Function to fetch a page from Notion
async function fetchNotionPage(pageId) {
  try {
    const response = await fetch(`${API_ENDPOINT}/pages/${pageId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Notion page:', error);
    throw error;
  }
}

// Function to fetch database entries
async function fetchNotionDatabase(filterConfig = {}) {
  try {
    const response = await fetch(`${API_ENDPOINT}/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filterConfig)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching database:', error);
    throw error;
  }
}

// Function to get project by slug
async function getProjectBySlug(slug) {
  try {
    console.log('Searching for project with slug:', slug);
    
    const filterConfig = {
      filter: {
        and: [
          {
            property: "Status",
            status: {
              equals: "Published"
            }
          },
          {
            property: "Slug",
            rich_text: {
              equals: slug
            }
          }
        ]
      }
    };

    console.log('Filter config:', JSON.stringify(filterConfig, null, 2));
    const database = await fetchNotionDatabase(filterConfig);
    
    if (!database.results || database.results.length === 0) {
      console.error('No project found with slug:', slug);
      throw new Error('Project not found');
    }

    const project = database.results[0];
    console.log('Found project:', project);
    return project;
  } catch (error) {
    console.error('Error getting project by slug:', error);
    throw error;
  }
}

// Function to get projects by category
async function getProjectsByCategory(category) {
  try {
    const filterConfig = {
      filter: {
        and: [
          {
            property: "Status",
            status: {
              equals: "Published"
            }
          },
          {
            property: "Category",
            multi_select: {
              contains: category
            }
          }
        ]
      }
    };

    const database = await fetchNotionDatabase(filterConfig);
    return database.results;
  } catch (error) {
    console.error('Error getting projects by category:', error);
    throw error;
  }
}

// Function to get all categories
async function getAllCategories() {
  try {
    const database = await fetchNotionDatabase();
    const categories = new Set();
    
    database.results.forEach(page => {
      const categoryTags = page.properties.Category?.multi_select || [];
      categoryTags.forEach(tag => categories.add(tag.name));
    });

    return Array.from(categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
}

// Function to render Notion content
async function renderNotionContent(pageId) {
  try {
    console.log('Fetching page content for:', pageId);
    // Get the actual page ID from the project
    const actualPageId = typeof pageId === 'object' ? pageId.id : pageId;
    console.log('Fetching blocks for page:', actualPageId);
    
    const response = await fetch(`${API_ENDPOINT}/blocks/${actualPageId}/children`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Received page data:', data);
    
    // Convert blocks to HTML
    let html = '';
    data.results.forEach(block => {
      switch (block.type) {
        case 'paragraph':
          const paragraphText = block.paragraph.rich_text.map(text => text.plain_text).join('');
          html += `<p>${paragraphText}</p>`;
          break;
          
        case 'heading_1':
          const h1Text = block.heading_1.rich_text.map(text => text.plain_text).join('');
          html += `<h1>${h1Text}</h1>`;
          break;
          
        case 'heading_2':
          const h2Text = block.heading_2.rich_text.map(text => text.plain_text).join('');
          html += `<h2>${h2Text}</h2>`;
          break;
          
        case 'heading_3':
          const h3Text = block.heading_3.rich_text.map(text => text.plain_text).join('');
          html += `<h3>${h3Text}</h3>`;
          break;
          
        case 'bulleted_list_item':
          const bulletText = block.bulleted_list_item.rich_text.map(text => text.plain_text).join('');
          html += `<ul><li>${bulletText}</li></ul>`;
          break;
          
        case 'numbered_list_item':
          const numberText = block.numbered_list_item.rich_text.map(text => text.plain_text).join('');
          html += `<ol><li>${numberText}</li></ol>`;
          break;
          
        case 'image':
          const imageUrl = block.image.type === 'external' ? block.image.external.url : block.image.file.url;
          const caption = block.image.caption?.length > 0 
            ? block.image.caption.map(text => text.plain_text).join('')
            : '';
          html += `
            <figure class="image-container">
              <img src="${imageUrl}" alt="${caption}" loading="lazy">
              ${caption ? `<figcaption>${caption}</figcaption>` : ''}
            </figure>
          `;
          break;
          
        case 'code':
          const codeText = block.code.rich_text.map(text => text.plain_text).join('');
          const language = block.code.language || 'plaintext';
          html += `
            <pre><code class="language-${language}">
              ${codeText}
            </code></pre>
          `;
          break;
          
        case 'quote':
          const quoteText = block.quote.rich_text.map(text => text.plain_text).join('');
          html += `<blockquote>${quoteText}</blockquote>`;
          break;
          
        case 'divider':
          html += '<hr>';
          break;
          
        default:
          console.log('Unhandled block type:', block.type);
      }
    });
    
    return html;
  } catch (error) {
    console.error('Error rendering content:', error);
    console.error('Error details:', error.message);
    throw error;
  }
}

// Function to get project categories
function getProjectCategories(project) {
  return project.properties.Category?.multi_select || [];
}

// Export functions
export {
  fetchNotionPage,
  fetchNotionDatabase,
  getProjectBySlug,
  renderNotionContent,
  getProjectsByCategory,
  getAllCategories,
  getProjectCategories
};