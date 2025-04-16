import { getProjectBySlug, renderNotionContent, getProjectCategories, fetchNotionDatabase, fetchNotionPage } from '/js/api/notion.js';

// Get current project slug from URL
const urlParams = new URLSearchParams(window.location.search);
const currentSlug = urlParams.get('project');

// Elements
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const headerEl = document.getElementById('project-header');
const contentEl = document.getElementById('notion-content');
const prevProjectEl = document.getElementById('prev-project');
const nextProjectEl = document.getElementById('next-project');
const prevTitleEl = document.getElementById('prev-title');
const nextTitleEl = document.getElementById('next-title');

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Check for saved theme preference, otherwise use system preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  root.setAttribute('data-theme', savedTheme);
} else {
  const systemTheme = prefersDarkScheme.matches ? 'dark' : 'light';
  root.setAttribute('data-theme', systemTheme);
}

// Toggle theme
themeToggle.addEventListener('click', () => {
  const currentTheme = root.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  root.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});

// Listen for system theme changes
prefersDarkScheme.addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    const newTheme = e.matches ? 'dark' : 'light';
    root.setAttribute('data-theme', newTheme);
  }
});

// Function to render categories
function renderCategories(categories) {
  return categories.map(category => 
    `<span class="category-tag ${category.name.toLowerCase()}">${category.name}</span>`
  ).join('');
}

// Function to render blocks
async function renderBlocks(pageId) {
  try {
    const response = await fetch(`http://localhost:3000/api/notion/blocks/${pageId}/children`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    let html = '';
    data.results.forEach(block => {
      switch (block.type) {
        case 'paragraph':
          const paragraphText = block.paragraph.rich_text.map(text => text.plain_text).join('');
          if (paragraphText.trim()) {
            html += `<p>${paragraphText}</p>`;
          }
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
    console.error('Error rendering blocks:', error);
    throw error;
  }
}

async function loadProject() {
  try {
    // Show loading state
    loadingEl.style.display = 'block';
    errorEl.style.display = 'none';
    
    // Fetch all published projects
    const response = await fetchNotionDatabase({
      filter: {
        property: "Status",
        status: {
          equals: "Published"
        }
      },
      sorts: [
        {
          property: "Date",
          direction: "descending"
        }
      ]
    });

    // Find current project and its index
    const projects = response.results;
    const currentIndex = projects.findIndex(
      project => project.properties.Slug.rich_text[0]?.plain_text === currentSlug
    );

    if (currentIndex === -1) {
      throw new Error('Project not found');
    }

    // Set up navigation
    const prevProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;
    const nextProject = currentIndex > 0 ? projects[currentIndex - 1] : null;

    if (prevProject) {
      const prevSlug = prevProject.properties.Slug.rich_text[0]?.plain_text;
      const prevTitle = prevProject.properties.Title.title[0]?.plain_text;
      prevProjectEl.href = `post.html?project=${prevSlug}`;
      prevTitleEl.textContent = prevTitle;
      prevProjectEl.classList.remove('hidden');
    } else {
      prevProjectEl.classList.add('hidden');
    }

    if (nextProject) {
      const nextSlug = nextProject.properties.Slug.rich_text[0]?.plain_text;
      const nextTitle = nextProject.properties.Title.title[0]?.plain_text;
      nextProjectEl.href = `post.html?project=${nextSlug}`;
      nextTitleEl.textContent = nextTitle;
      nextProjectEl.classList.remove('hidden');
    } else {
      nextProjectEl.classList.add('hidden');
    }

    // Fetch and display current project
    const currentProject = projects[currentIndex];
    
    // Clear existing header content
    headerEl.innerHTML = '';
    
    // Add cover image if available
    if (currentProject.properties.Cover?.files[0]) {
      const coverUrl = currentProject.properties.Cover.files[0].file?.url || 
                      currentProject.properties.Cover.files[0].external?.url;
      if (coverUrl) {
        const coverImage = document.createElement('img');
        coverImage.src = coverUrl;
        coverImage.alt = currentProject.properties.Title.title[0]?.plain_text;
        coverImage.className = 'project-cover';
        headerEl.appendChild(coverImage);
      }
    }
    
    // Add title
    const titleEl = document.createElement('h1');
    titleEl.textContent = currentProject.properties.Title.title[0]?.plain_text;
    headerEl.appendChild(titleEl);
    
    // Add categories
    const categoriesDiv = document.createElement('div');
    categoriesDiv.className = 'categories';
    const categories = currentProject.properties.Category?.multi_select || [];
    categories.forEach(category => {
      const categoryTag = document.createElement('span');
      categoryTag.className = `category-tag ${category.name.toLowerCase()}`;
      categoryTag.textContent = category.name;
      categoriesDiv.appendChild(categoryTag);
    });
    headerEl.appendChild(categoriesDiv);

    // Fetch and render page content
    const pageContent = await renderBlocks(currentProject.id);
    contentEl.innerHTML = pageContent;

    // Hide loading state
    loadingEl.style.display = 'none';
  } catch (error) {
    console.error('Error:', error);
    loadingEl.style.display = 'none';
    errorEl.style.display = 'block';
  }
}

// Load project when page loads
document.addEventListener('DOMContentLoaded', loadProject); 