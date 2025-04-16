import { fetchNotionPosts } from './notion-api.js';

document.addEventListener('DOMContentLoaded', async function() {
  const worksGrid = document.querySelector('.works-grid');
  const filterContainer = document.createElement('div');
  filterContainer.className = 'filter-container';
  
  try {
    const posts = await fetchNotionPosts();
    
    // Clear existing content
    worksGrid.innerHTML = '';
    
    // Add all posts to grid
    posts.forEach(post => {
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
        <p class="post-date">${new Date(post.date).toLocaleDateString()}</p>
      `;
      worksGrid.appendChild(workItem);
    });

    // Initialize animations
    initializeWorkAnimations();
  } catch (error) {
    console.error('Error loading category posts:', error);
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