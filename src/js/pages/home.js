import { fetchNotionDatabase } from '../api/notion.js';

async function loadProjects() {
  try {
    // Show loading state
    const projectsContainer = document.getElementById('projects-grid');
    projectsContainer.innerHTML = '<div id="loading">Loading projects...</div>';
    
    // Fetch published projects from Notion
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

    // Clear loading state
    projectsContainer.innerHTML = '';

    // Render each project
    response.results.forEach(project => {
      // Safely get properties with fallbacks
      const title = project.properties.Title?.title[0]?.plain_text || 'Untitled';
      const slug = project.properties.Slug?.rich_text[0]?.plain_text;
      const categories = project.properties.Category?.multi_select || [];
      const coverImage = project.properties.Cover?.files[0]?.file?.url || 'assets/images/default-project.jpg';

      // Only create card if we have a valid slug
      if (slug) {
        const projectHTML = `
          <div class="project-card">
            <div class="project-image">
              <img src="${coverImage}" alt="${title}" onerror="this.src='assets/images/default-project.jpg'">
              <div class="project-overlay">
                <a href="post/post.html?project=${encodeURIComponent(slug)}" class="view-project" 
                   onclick="event.preventDefault(); window.location.href='post/post.html?project=${encodeURIComponent(slug)}'">
                   View Project →
                </a>
              </div>
            </div>
            <div class="project-info">
              <h3>${title}</h3>
              <div class="project-categories">
                ${categories.map(cat => `<span class="category-tag ${cat.name.toLowerCase()}">${cat.name}</span>`).join('')}
              </div>
            </div>
          </div>
        `;

        projectsContainer.insertAdjacentHTML('beforeend', projectHTML);
      }
    });

    // If no projects were loaded, show a message
    if (projectsContainer.children.length === 0) {
      projectsContainer.innerHTML = '<div class="no-projects">No published projects found</div>';
    }

  } catch (error) {
    console.error('Error loading projects:', error);
    const projectsContainer = document.getElementById('projects-grid');
    projectsContainer.innerHTML = '<div class="error-message">Error loading projects. Please try again later.</div>';
  }
}

// Load projects when the page loads
document.addEventListener('DOMContentLoaded', loadProjects);

// Add error handling for images
document.addEventListener('error', function(e) {
  if (e.target.tagName.toLowerCase() === 'img') {
    e.target.src = 'assets/images/default-project.jpg';
  }
}, true); 