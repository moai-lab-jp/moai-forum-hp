// SEO用のViteプラグイン。
//  - index.html に canonical / OGP / 構造化データ(JSON-LD) を挿入
//  - アーカイブ一覧を index.html に静的に埋め込み
//  - 各回の静的ページ archive/<slug>.html を生成
//  - sitemap.xml / robots.txt を生成
import { meetingsData } from './meetings_data.js';
import { meetingName, meetingSlug, timelineHtml } from './archive_render.js';
import * as config from './site.config.js';

const SITE_URL = (process.env.SITE_URL || config.SITE_URL || '').replace(/\/+$/, '');
const { SITE_NAME, SITE_DESCRIPTION, nextEvent } = config;

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const abs = (path) => (SITE_URL ? `${SITE_URL}/${path}` : null);

const jsonLd = (data) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

function organizationLd() {
  return {
    '@type': 'Organization',
    '@id': SITE_URL ? `${SITE_URL}/#organization` : undefined,
    name: SITE_NAME,
    alternateName: ['MOAIフォーラム', 'モアイフォーラム', 'MOAI研究部会'],
    description: SITE_DESCRIPTION,
    url: SITE_URL ? `${SITE_URL}/` : undefined,
    logo: abs('favicon.png') || undefined,
    parentOrganization: {
      '@type': 'Organization',
      name: 'スケジューリング学会',
      url: 'http://www.scheduling.jp/',
    },
  };
}

function eventLd(ev) {
  return {
    '@type': 'Event',
    name: ev.name,
    description: ev.description,
    startDate: ev.startDate,
    endDate: ev.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
    inLanguage: 'ja',
    location: [
      {
        '@type': 'Place',
        name: ev.venueName,
        address: { '@type': 'PostalAddress', ...ev.venueAddress },
      },
      { '@type': 'VirtualLocation', url: ev.onlineUrl },
    ],
    image: abs('og-image.jpg') || undefined,
    url: SITE_URL ? `${SITE_URL}/#next-event` : undefined,
    organizer: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL ? `${SITE_URL}/` : undefined },
    performer: ev.performers.map((p) => ({
      '@type': 'Person',
      name: p.name,
      affiliation: { '@type': 'Organization', name: p.affiliation },
    })),
    offers: {
      '@type': 'Offer',
      url: ev.registrationUrl,
      availability: 'https://schema.org/InStock',
    },
  };
}

// URLに依存する head 要素（トップページ・各回ページ共通）
function urlHeadTags(pagePath, title, description) {
  const url = abs(pagePath);
  return [
    url && `<link rel="canonical" href="${esc(url)}">`,
    url && `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    SITE_URL && `<meta property="og:image" content="${esc(abs('og-image.jpg'))}">`,
    SITE_URL && `<meta property="og:image:width" content="1200">`,
    SITE_URL && `<meta property="og:image:height" content="630">`,
    SITE_URL && `<meta name="twitter:image" content="${esc(abs('og-image.jpg'))}">`,
  ]
    .filter(Boolean)
    .join('\n  ');
}

function plainText(html) {
  return html
    .replace(/<div class="notion-link-wrapper">[\s\S]*?<\/div>/g, '')
    .replace(/<h1[\s\S]*?<\/h1>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function meetingDescription(meeting) {
  const text = plainText(meeting.html);
  const body = text.length > 110 ? `${text.slice(0, 110)}…` : text;
  return `${meetingName(meeting)}の開催記録。${body}`;
}

function meetingBodyHtml(meeting) {
  return meeting.html
    .replace(/<div class="notion-link-wrapper">[\s\S]*?<\/div>/g, '')
    .replace(/(src|href)="\.\/images\//g, '$1="../images/')
    .replace(/<img /g, '<img loading="lazy" ')
    .replace(/<iframe /g, `<iframe loading="lazy" title="${esc(meetingName(meeting))} 講演動画" `);
}

function meetingPage(meeting, index, cssFile) {
  const name = meetingName(meeting);
  const slug = meetingSlug(meeting);
  const path = `archive/${slug}.html`;
  const title = `${name} 開催記録 | ${SITE_NAME}（数理最適化×機械学習）`;
  const description = meetingDescription(meeting);
  const older = meetingsData[index - 1];
  const newer = meetingsData[index + 1];

  const ld = SITE_URL
    ? jsonLd({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: '過去の部会', item: `${SITE_URL}/#archive` },
          { '@type': 'ListItem', position: 3, name, item: abs(path) },
        ],
      })
    : '';

  const pagerLink = (m, label, cls) =>
    m
      ? `<a class="archive-pager-link ${cls}" href="./${meetingSlug(m)}.html"><span class="archive-pager-label">${label}</span><span>${esc(meetingName(m))}</span></a>`
      : '<span></span>';

  return `<!DOCTYPE html>
<html lang="ja">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="theme-color" content="#080b11">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${esc(SITE_NAME)}">
  <meta property="og:locale" content="ja_JP">
  <meta name="twitter:card" content="summary_large_image">
  ${urlHeadTags(path, title, description)}
  <link rel="icon" type="image/png" href="../favicon.png">
  <link rel="apple-touch-icon" href="../apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+JP:wght@300;400;500;700&family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="../${cssFile}">
  ${ld}
</head>

<body>
  <header class="main-header">
    <div class="container header-container">
      <a href="../" class="logo"><span class="logo-accent">MO/AI</span> Forum</a>
      <nav class="nav-menu" id="navMenu">
        <a href="../#about" class="nav-link">About</a>
        <a href="../#next-event" class="nav-link">Next Event</a>
        <a href="../#members" class="nav-link">Members</a>
        <a href="../#archive" class="nav-link">Archive</a>
      </nav>
      <button class="mobile-toggle" id="mobileToggle" aria-label="Toggle navigation">
        <i class="fa-solid fa-bars"></i>
      </button>
    </div>
  </header>

  <main class="archive-page">
    <div class="container archive-page-container">
      <nav class="archive-breadcrumb" aria-label="パンくずリスト">
        <a href="../">${esc(SITE_NAME)}</a>
        <i class="fa-solid fa-chevron-right"></i>
        <a href="../#archive">過去の部会</a>
        <i class="fa-solid fa-chevron-right"></i>
        <span aria-current="page">${esc(name)}</span>
      </nav>

      <article class="archive-page-card glass modal-content">
        ${meetingBodyHtml(meeting)}
      </article>

      <nav class="archive-pager" aria-label="前後の開催記録">
        ${pagerLink(older, '<i class="fa-solid fa-chevron-left"></i> 前の回', 'prev')}
        ${pagerLink(newer, '次の回 <i class="fa-solid fa-chevron-right"></i>', 'next')}
      </nav>

      <p class="archive-page-cta">
        <a href="../#next-event" class="btn btn-primary">次回の研究部会を見る</a>
        <a href="../#archive" class="btn btn-outline">開催記録の一覧へ</a>
      </p>
    </div>
  </main>

  <footer class="main-footer">
    <div class="container footer-container">
      <div class="footer-brand"><span class="logo-accent">MO/AI</span> Forum</div>
      <p class="copyright">&copy; 2026 MOAI Forum. All Rights Reserved.</p>
    </div>
  </footer>

  <script>
    document.getElementById('mobileToggle').addEventListener('click', function () {
      document.getElementById('navMenu').classList.toggle('show');
    });
  </script>
</body>

</html>
`;
}

function sitemapXml() {
  const urls = [`${SITE_URL}/`, ...meetingsData.map((m) => abs(`archive/${meetingSlug(m)}.html`))];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${esc(u)}</loc></url>`).join('\n')}
</urlset>
`;
}

export default function seoPlugin() {
  return {
    name: 'moai-seo',

    transformIndexHtml(html) {
      const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || SITE_NAME;
      const graph = [organizationLd()];
      if (SITE_URL) {
        graph.push({
          '@type': 'WebSite',
          name: SITE_NAME,
          url: `${SITE_URL}/`,
          inLanguage: 'ja',
          publisher: { '@id': `${SITE_URL}/#organization` },
        });
      }
      if (nextEvent) graph.push(eventLd(nextEvent));

      const head = [
        `<meta name="description" content="${esc(SITE_DESCRIPTION)}">`,
        urlHeadTags('', title.trim(), SITE_DESCRIPTION),
        jsonLd({ '@context': 'https://schema.org', '@graph': graph }),
      ].join('\n  ');

      return html
        .replace('<!-- SEO:HEAD -->', head)
        .replace('<!-- SEO:ARCHIVE -->', timelineHtml(meetingsData));
    },

    generateBundle(_options, bundle) {
      const cssFile = Object.keys(bundle).find((f) => f.endsWith('.css'));
      meetingsData.forEach((meeting, i) => {
        this.emitFile({
          type: 'asset',
          fileName: `archive/${meetingSlug(meeting)}.html`,
          source: meetingPage(meeting, i, cssFile),
        });
      });

      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n${SITE_URL ? `\nSitemap: ${SITE_URL}/sitemap.xml\n` : ''}`,
      });

      if (SITE_URL) {
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml() });
      } else {
        this.warn('SITE_URL が未設定のため canonical / og:url / sitemap.xml を出力していません（site.config.js）。');
      }
    },
  };
}
