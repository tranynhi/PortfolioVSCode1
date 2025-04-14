// Highlight headings on scroll
document.addEventListener("DOMContentLoaded", () => {
    const headers = document.querySelectorAll(".post-body h2");
  
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.color = "#3366cc";
        } else {
          entry.target.style.color = "#222";
        }
      });
    }, { threshold: 0.5 });
  
    headers.forEach(h => observer.observe(h));
  });
  
 // fetch
 const NOTION_API_KEY = "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"; // Dán token bạn vừa copy tại đây
const DATABASE_ID = "1d528e8b6f0c808ba49ce4ecceec8f07"; // ID từ URL database
const PAGE_SLUG = getSlugFromURL();

function getSlugFromURL() {
  const url = new URL(window.location.href);
  return url.searchParams.get("slug");
}

async function fetchNotionPost(slug) {
  const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": "2022-06-28",
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
  if (data.results.length > 0) {
    const page = data.results[0];
    renderPost(page);
  } else {
    document.querySelector(".post-content").innerHTML = "<p>Không tìm thấy bài viết.</p>";
  }
}

function renderPost(page) {
  const title = page.properties.Title.title[0].text.content;
  const content = page.properties.Content.rich_text[0].text.content;

  document.querySelector(".post-title").textContent = title;
  document.querySelector(".post-body").innerHTML = `<p>${content}</p>`;
}

document.addEventListener("DOMContentLoaded", () => {
  if (PAGE_SLUG) {
    fetchNotionPost(PAGE_SLUG);
  } else {
    document.querySelector(".post-content").innerHTML = "<p>Không có slug được truyền.</p>";
  }
});
if (data.results.length > 0) {
    const page = data.results[0];
    renderPost(page);
  } else {
    document.querySelector(".post-content").innerHTML = "<p>Không tìm thấy bài viết tương ứng với slug này.</p>";
  }

  console.log("Looking for slug:", slug);
  console.log("Notion response:", data);
