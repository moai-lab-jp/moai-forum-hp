// サイト全体のSEO設定。ビルド時に seo-plugin.js が読み込みます。

// 公開URL（末尾スラッシュなし）。例: 'https://forum.example.jp'
// 空のままだと canonical / og:url / sitemap.xml は出力されません。
// 環境変数 SITE_URL でも指定できます（例: SITE_URL=https://... npm run build）。
export const SITE_URL = '';

export const SITE_NAME = 'MOAI Forum';

export const SITE_DESCRIPTION =
  'MOAI Forum（モアイフォーラム）は、数理最適化と機械学習・AIの融合をテーマとするスケジューリング学会の研究部会です。大学・企業の研究者や実務家による講演会を定期開催し、過去の講演動画・資料も公開しています。';

// 次回イベント。Google検索の「イベント」リッチリザルト用の構造化データになります。
// index.html の「Next Event」を更新したら、ここも合わせて更新してください。
// 終了後は null にすると出力されなくなります。
export const nextEvent = {
  name: '第11回 MOAI 研究部会',
  description:
    '数理最適化と機械学習・AIの融合に関する研究部会。西角 直樹 氏（三菱総合研究所）「AIエージェントは「組織の壁」を超える」、根岸 信太郎 氏（神奈川大学）「電力システム最適化の実践」、野々部 宏司 氏（法政大学 / MOAI-Lab.）「スケジューリング最適化ソルバーの再設計」の3講演。対面・Zoomオンラインのハイブリッド開催。',
  startDate: '2026-12-18T15:00:00+09:00',
  endDate: '2026-12-18T18:30:00+09:00',
  venueName: '青山学院大学 総研ビル 8F 第10会議室',
  venueAddress: {
    postalCode: '150-8366',
    addressRegion: '東京都',
    addressLocality: '渋谷区',
    streetAddress: '渋谷4-4-25',
    addressCountry: 'JP',
  },
  onlineUrl: 'https://us06web.zoom.us/meeting/register/aBvn9BaWQZ6PYT81N7RYrA',
  registrationUrl: 'https://forms.gle/HuLXxTcgvoYCtBvUA',
  performers: [
    { name: '西角 直樹', affiliation: '三菱総合研究所' },
    { name: '根岸 信太郎', affiliation: '神奈川大学' },
    { name: '野々部 宏司', affiliation: '法政大学' },
  ],
};
