// Utility functions
const utils = {
  // Debounce function for performance
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Safe querySelector with error handling
  $(selector, parent = document) {
    try {
      const element = parent.querySelector(selector);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }
      return element;
    } catch (error) {
      console.error(`Query selector error: ${error.message}`);
      return null;
    }
  },

  // Safe querySelectorAll
  $$(selector, parent = document) {
    try {
      return [...parent.querySelectorAll(selector)];
    } catch (error) {
      console.error(`Query selector all error: ${error.message}`);
      return [];
    }
  }
};

// Loading Screen Manager
class LoadingScreen {
  constructor() {
    this.elements = {
      loadingScreen: document.querySelector(".loading-screen"),
      counter: document.querySelector(".counter"),
      flower: document.querySelector(".flower"),
      logo: document.querySelector(".logo"),
      circle: document.querySelector(".progress-ring__circle")
    };

    // Đảm bảo loading screen hiển thị trên cùng
    if (this.elements.loadingScreen) {
      this.elements.loadingScreen.style.zIndex = "99999";
    }

    this.init();
  }

  init() {
    if (!this.validateElements()) {
      this.handleError();
      return;
    }

    document.body.style.overflow = 'hidden'; // Prevent scrolling during loading
    this.startLoading();
  }

  validateElements() {
    return Object.values(this.elements).every(element => element !== null);
  }

  startLoading() {
    const { circle, counter } = this.elements;
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    
    circle.style.strokeDasharray = `${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;

    let count = 0;
    const interval = setInterval(() => {
      if (count > 99) {
        clearInterval(interval);
        this.completeLoading();
        return;
      }

      this.updateProgress(count, circumference);
      count++;
    }, 20);
  }

  updateProgress(count, circumference) {
    const { circle, counter } = this.elements;
    counter.textContent = count;
    const percent = count / 99;
    circle.style.strokeDashoffset = circumference - percent * circumference;
  }

  async completeLoading() {
    const { counter, circle, flower, logo, loadingScreen } = this.elements;

    try {
      // 1. Fade out counter and circle with opacity
      counter.style.opacity = '0';
      circle.style.opacity = '0';
      await this.wait(300);

      // 2. Show and animate flower
      flower.style.opacity = '1';
      flower.style.transform = 'translate(-50%, -50%) scale(1) rotate(360deg)';
      await this.wait(1000);

      // 3. Move flower up
      flower.style.transform = 'translate(-50%, calc(-50% - 40px)) rotate(720deg)';
      await this.wait(700);

      // 4. Show logo
      logo.style.opacity = '1';
      logo.style.transform = 'translateY(-80px)';
      await this.wait(2000);

      // 5. Hide loading screen with transform and opacity
      loadingScreen.style.opacity = '0';
      loadingScreen.style.transform = 'translateY(-100%)';
      await this.wait(1000);

      // 6. Complete cleanup
      this.cleanupLoading();

    } catch (error) {
      console.error('Loading animation error:', error);
      this.handleError();
    }
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  cleanupLoading() {
    const { loadingScreen } = this.elements;
    
    // Remove loading screen from DOM
    loadingScreen.style.display = 'none';
    
    // Re-enable scrolling
    document.body.style.overflow = '';
    
    // Remove any leftover styles
    document.body.classList.remove('loading');
    
    // Ensure z-index is reset
    loadingScreen.style.zIndex = '';
  }

  handleError() {
    console.error('Loading screen error - forcing cleanup');
    this.cleanupLoading();
  }
}

// About Section Manager
class AboutSection {
  constructor() {
    this.paragraph = utils.$('#typing-paragraph');
    this.fullText = `I'm a UI/UX designer from Vietnam, passionate about nature, technology, and user research. I strive to create meaningful, user-centered experiences.`;
    this.init();
  }

  init() {
    if (!this.paragraph) return;

    gsap.registerPlugin(ScrollTrigger);
    this.setupScrollTrigger();
  }

  setupScrollTrigger() {
    ScrollTrigger.create({
      trigger: ".about",
      start: "top 80%",
      onEnter: () => {
        this.paragraph.innerHTML = "";
        this.typeText(this.fullText, this.paragraph);
        utils.$(".about")?.classList.add("visible");
        utils.$(".flower-icon")?.classList.add("rotate");
      },
      once: true
    });
  }

  typeText(text, element) {
    return new Promise((resolve) => {
      let i = 0;
      const speed = 30;
      
      const type = () => {
        if (i < text.length) {
          const char = text.charAt(i);
          if (char === "\n") {
            element.innerHTML += "<br>";
          } else {
            element.innerHTML += char;
          }
          i++;
          requestAnimationFrame(type);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(type);
    });
  }
}

// Experience Section Animations
class ExperienceSection {
  constructor() {
    this.init();
  }

  init() {
    this.animateProfileCards();
    this.animateRightSection();
  }

  animateProfileCards() {
    const cards = utils.$$('.profile-card');
    cards.forEach((card, i) => {
      gsap.from(card, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        delay: i * 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      });
    });
  }

  animateRightSection() {
    const rightSection = utils.$('.right');
    if (!rightSection) return;

    gsap.from(rightSection, {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: rightSection,
        start: "top 80%",
        toggleActions: "play none none none"
      }
    });
  }
}

// Horizontal Scroll Manager
class HorizontalScroll {
  constructor() {
    this.container = utils.$('.horizontal-scroll');
    this.init();
  }

  init() {
    if (!this.container) return;

    gsap.registerPlugin(ScrollTrigger);
    this.setupScroll();
  }

  setupScroll() {
    gsap.to(this.container, {
      xPercent: -80,
      ease: "none",
      scrollTrigger: {
        trigger: this.container,
        pin: true,
        scrub: 1,
        end: () => "+=" + this.container.offsetWidth,
      },
    });
  }
}

// Work Section Animations
class WorkSection {
  constructor() {
    this.init();
  }

  init() {
    const workItems = utils.$$('.work-item');
    this.animateWorkItems(workItems);
  }

  animateWorkItems(items) {
    items.forEach((card, i) => {
      gsap.to(card, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: i * 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          toggleActions: "play none none none"
        }
      });
    });
  }
}

// Performance Monitoring
class PerformanceMonitor {
  static init() {
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
  }

  static observeLCP() {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('Largest Contentful Paint:', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  }

  static observeFID() {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const firstInput = entries[0];
      console.log('First Input Delay:', firstInput.processingStart - firstInput.startTime);
    }).observe({ entryTypes: ['first-input'] });
  }

  static observeCLS() {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      let clsValue = 0;
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      console.log('Cumulative Layout Shift:', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }
}

// Image handling functions
function handleImageError(img) {
  console.error(`Failed to load image: ${img.src}`);
  
  // Try with different path patterns
  const pathsToTry = [
    '/assets/images/tech.png',
    './assets/images/tech.png',
    '../assets/images/tech.png',
    img.src.replace('/assets/', '/PortfolioVSCode/assets/')
  ];

  tryLoadingImage(img, pathsToTry);
}

function tryLoadingImage(img, paths) {
  // Keep track of the original source
  const originalSrc = img.src;
  
  // Try each path
  const tryNextPath = () => {
    if (paths.length === 0) {
      console.error('All paths failed, showing error state');
      showImageError(img);
      return;
    }

    const nextPath = paths.shift();
    console.log(`Trying path: ${nextPath}`);
    
    img.onerror = () => {
      console.log(`Failed path: ${nextPath}`);
      tryNextPath();
    };
    
    img.src = nextPath;
  };

  tryNextPath();
}

function showImageError(img) {
  // Add error class
  img.classList.add('img-error');
  
  // Create error message container
  const errorContainer = document.createElement('div');
  errorContainer.className = 'image-error-message';
  errorContainer.innerHTML = `
    <p>⚠️ Image failed to load</p>
    <button onclick="retryLoadImage(this.parentElement.previousElementSibling)">
      Retry Loading
    </button>
  `;
  
  // Insert after the image
  img.parentNode.insertBefore(errorContainer, img.nextSibling);
}

function retryLoadImage(img) {
  // Remove error state
  img.classList.remove('img-error');
  
  // Remove error message if exists
  const errorMessage = img.nextElementSibling;
  if (errorMessage?.classList.contains('image-error-message')) {
    errorMessage.remove();
  }
  
  // Retry loading with original source
  img.src = img.getAttribute('data-original-src') || img.src;
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Initialize performance monitoring
    PerformanceMonitor.init();

    // Initialize main components
    new LoadingScreen();
    new AboutSection();
    new ExperienceSection();
    new HorizontalScroll();
    new WorkSection();

    // Store original sources
    document.querySelectorAll('img').forEach(img => {
      img.setAttribute('data-original-src', img.src);
    });

  } catch (error) {
    console.error('Initialization error:', error);
  }
});

// Handle reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (prefersReducedMotion.matches) {
  // Disable animations
  gsap.globalTimeline.timeScale(100);
}
