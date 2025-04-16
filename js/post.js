// Import required modules
import { getProjectBySlug, renderNotionContent } from './notion.js';

// Get project slug from URL
const urlParams = new URLSearchParams(window.location.search);
const projectSlug = urlParams.get('project');

// DOM elements
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const projectHeaderElement = document.getElementById('project-header');
const notionContentElement = document.getElementById('notion-content');

async function loadProject() {
  try {
    loadingElement.style.display = 'block';
    errorElement.style.display = 'none';

    // Get project data
    const project = await getProjectBySlug(projectSlug);
    
    // Update header
    const headerHtml = `
      <h1>${project.properties.Title.title[0].plain_text}</h1>
      <div class="project-meta">
        ${project.properties.Category.multi_select.map(cat => `<span class="category-tag">${cat.name}</span>`).join('')}
      </div>
    `;
    projectHeaderElement.innerHTML = headerHtml;

    // Render Notion content
    const contentHtml = await renderNotionContent(project);
    notionContentElement.innerHTML = contentHtml;

    loadingElement.style.display = 'none';
  } catch (error) {
    console.error('Error loading project:', error);
    loadingElement.style.display = 'none';
    errorElement.style.display = 'block';
  }
}

// Load project when page loads
loadProject();
