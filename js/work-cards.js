document.addEventListener('DOMContentLoaded', function() {
  // Initialize GSAP ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // Animate work cards on scroll
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
}); 