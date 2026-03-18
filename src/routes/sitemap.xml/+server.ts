export function GET() {
	const siteUrl = 'https://engabe.com';
	const pages = [
		{ path: '/', priority: '1.0', changefreq: 'weekly' },
		{ path: '/about', priority: '0.8', changefreq: 'monthly' },
		{ path: '/work', priority: '0.8', changefreq: 'weekly' },
		{ path: '/contact', priority: '0.7', changefreq: 'monthly' }
	];

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
	.map(
		(page) => `  <url>
    <loc>${siteUrl}${page.path}</loc>
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
