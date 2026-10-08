async function main() {
  const res = await fetch('https://public-api.wordpress.com/wp/v2/sites/thepublisherspen.wordpress.com/posts?_embed&per_page=50');
  const posts = await res.json();
  console.log('Total posts fetched:', posts.length);
  for (const p of posts) {
    const featured = p.jetpack_featured_media_url || p._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    const imgMatch = p.content?.rendered?.match(/<img[^>]+src=["']([^"']+)["']/i);
    const firstImg = imgMatch ? imgMatch[1] : null;
    const authorName = p._embedded?.author?.[0]?.name || 'Ngbede Odeh';
    const categories = p._embedded?.['wp:term']?.[0]?.map(t => t.name) || [];
    console.log({
      id: p.id,
      slug: p.slug,
      title: p.title?.rendered,
      image: featured || firstImg,
      author: authorName,
      categories,
      contentLen: p.content?.rendered?.length
    });
  }
}
main().catch(console.error);
