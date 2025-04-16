import { fetchNotionPosts } from './notion-api.js';

document.addEventListener('DOMContentLoaded', async function() {
  const worksGrid = document.querySelector('.works-grid');
  const viewMoreBtn = document.createElement('a');
  viewMoreBtn.href = '/category';
  viewMoreBtn.className = 'view-more-btn';
  viewMoreBtn.textContent = 'View More →';

  try {
    const posts = await fetchNotionPosts();
    const maxDisplayedPosts = 9;
    const displayedPosts = posts.slice(0, maxDisplayedPosts);

    // Clear existing content
    worksGrid.innerHTML = '';

    // Add posts to grid
    displayedPosts.forEach(post => {
      const workItem = document.createElement('article');
      workItem.className = 'work-item';
      workItem.innerHTML = `
        <div class="image-wrapper">
          <img src="${post.cover}" alt="${post.title}" class="work-image">
          <div class="overlay">
            <a href="/post/${post.slug}" class="view-project">View Project →</a>
          </div>
        </div>
        <h3>${post.title}</h3>
      `;
      worksGrid.appendChild(workItem);
    });

    // Add view more button if there are more posts
    if (posts.length > maxDisplayedPosts) {
      const viewMoreContainer = document.createElement('div');
      viewMoreContainer.className = 'view-more-container';
      viewMoreContainer.appendChild(viewMoreBtn);
      worksGrid.parentNode.appendChild(viewMoreContainer);
    }

    // Initialize animations
    initializeWorkAnimations();
  } catch (error) {
    console.error('Error loading works:', error);
  }
});

function initializeWorkAnimations() {
  const workItems = document.querySelectorAll('.work-item');
  
  workItems.forEach((item, index) => {
    gsap.from(item, {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: item,
        start: "top bottom-=100",
        toggleActions: "play none none reverse"
      }
    });

    // Hover effects
    const image = item.querySelector('.work-image');
    const title = item.querySelector('h3');
    const overlay = item.querySelector('.overlay');
    const viewProject = item.querySelector('.view-project');

    item.addEventListener('mouseenter', () => {
      gsap.to(image, {
        scale: 1.05,
        duration: 0.5,
        ease: "power2.out"
      });
      gsap.to(title, {
        y: -10,
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      });
      gsap.to(overlay, {
        opacity: 1,
        duration: 0.3
      });
      gsap.to(viewProject, {
        y: 0,
        opacity: 1,
        duration: 0.3
      });
    });

    item.addEventListener('mouseleave', () => {
      gsap.to(image, {
        scale: 1,
        duration: 0.5,
        ease: "power2.out"
      });
      gsap.to(title, {
        y: 0,
        opacity: 0.8,
        duration: 0.3,
        ease: "power2.out"
      });
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.3
      });
      gsap.to(viewProject, {
        y: 20,
        opacity: 0,
        duration: 0.3
      });
    });
  });
} 