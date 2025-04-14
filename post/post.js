// 🔹 Highlight headings on scroll
document.addEventListener("DOMContentLoaded", () => {
  const headers = document.querySelectorAll(".post-body h2");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.style.color = entry.isIntersecting ? "#3366cc" : "#222";
    });
  }, { threshold: 0.5 });

  headers.forEach(h => observer.observe(h));
});

// 🔹 Lấy slug từ URL
function getSlugFromURL() {
  const url = new URL(window.location.href);
  return url.searchParams.get("slug");
}

const slugFromURL = getSlugFromURL();

// 🔹 Gọi API qua proxy server
async function fetchNotionPost(slug) {
  try {
    const res = await fetch("http://localhost:3001/api/notion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        filter: {
          property: "Slug",
          rich_text: {
            equals: slug
          }
        }
      })
    });

    const data = await res.json();
    console.log("🔍 Looking for slug:", slug);
    console.log("✅ Notion response:", data);

    if (data.results && data.results.length > 0) {
      renderPost(data.results[0]);
    } else {
      document.querySelector(".post-content").innerHTML = "<p>Không tìm thấy bài viết tương ứng với slug này.</p>";
    }
  } catch (error) {
    console.error("❌ Error fetching post:", error);
    document.querySelector(".post-content").innerHTML = "<p>Đã xảy ra lỗi khi tải bài viết.</p>";
  }
}

// 🔹 Render nội dung ra HTML
function renderPost(page) {
  const title = page.properties?.Title?.title?.[0]?.text?.content || "Untitled";
  const content = page.properties?.Content?.rich_text?.[0]?.text?.content || "Không có nội dung.";

  document.querySelector(".post-title").textContent = title;
  document.querySelector(".post-body").innerHTML = `<p>${content}</p>`;
}

// 🔹 Gọi khi trang load
document.addEventListener("DOMContentLoaded", () => {
  if (slugFromURL) {
    fetchNotionPost(slugFromURL);
  } else {
    document.querySelector(".post-content").innerHTML = "<p>Không có slug được truyền.</p>";
  }
});
