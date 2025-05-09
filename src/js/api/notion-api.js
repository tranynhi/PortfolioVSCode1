const API_ENDPOINT = 'https://tranynhi.onrender.com/api/notion';
const DATABASE_ID = '1d528e8b6f0c808ba49ce4ecceec8f07';

async function fetchNotionPosts() {
  try {
    const response = await fetch(`${API_ENDPOINT}/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sorts: [
          {
            property: 'Date',
            direction: 'descending'
          }
        ]
      })
    });

    const data = await response.json();
    return data.results.map(page => ({
      id: page.id,
      title: page.properties.Title.title[0].plain_text,
      description: page.properties.Description.rich_text[0].plain_text,
      cover: page.properties.Cover.files[0].file.url,
      date: page.properties.Date.date.start,
      slug: page.properties.Slug.rich_text[0].plain_text
    }));
  } catch (error) {
    console.error('Error fetching Notion posts:', error);
    return [];
  }
}

export { fetchNotionPosts };