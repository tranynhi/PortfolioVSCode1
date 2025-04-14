// Hiển thị từng work-item khi scroll vào viewport
document.addEventListener("DOMContentLoaded", function () {
    const items = document.querySelectorAll(".work-item");
  
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target); // chỉ animate 1 lần
          }
        });
      },
      {
        threshold: 0.1,
      }
    );
  
    items.forEach(item => {
      observer.observe(item);
    });
  });
  