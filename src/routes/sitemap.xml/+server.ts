export function GET() {
	const siteUrl = 'https://engabe.com';
	const today = new Date().toISOString().split('T')[0];
	const pages = [
		{ path: '/', priority: '1.0', changefreq: 'weekly', lastmod: today },
		{ path: '/about', priority: '0.9', changefreq: 'monthly', lastmod: today },
		{ path: '/work', priority: '0.8', changefreq: 'weekly', lastmod: today },
		{ path: '/contact', priority: '0.8', changefreq: 'monthly', lastmod: today }
	];

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
	.map(
		(page) => `  <url>
    <loc>${siteUrl}${page.path}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
}
