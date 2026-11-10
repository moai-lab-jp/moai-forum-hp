// アーカイブ一覧の描画。ブラウザ(main.js)とビルド(seo-plugin.js)の両方から使います。

export function meetingName(meeting) {
  return meeting.name.replace('SUB-PAGE Link', '').replace(/\s+/g, ' ').trim();
}

// 各回の静的ページのファイル名（archive/<slug>.html）
export function meetingSlug(meeting) {
  if (meeting.num !== 99) return `meeting-${meeting.num}`;
  const year = (meeting.date.match(/(20\d{2})年/) || [])[1];
  return `symposium-${year || meeting.id.slice(0, 8)}`;
}

export function meetingTag(meeting) {
  return meeting.num === 99 ? 'シンポジウム' : `第 ${meeting.num} 回`;
}

export function timelineItemHtml(meeting) {
  return `
    <div class="timeline-item">
      <div class="timeline-card glass" data-id="${meeting.id}" style="cursor: pointer;">
        <div class="timeline-content">
          <div class="timeline-header">
            <span class="timeline-tag">${meetingTag(meeting)}</span>
            <h3 class="timeline-title">${meetingName(meeting)}</h3>
          </div>
          <div class="timeline-details">
            <span><i class="fa-regular fa-calendar"></i> ${meeting.date}</span>
            <span><i class="fa-solid fa-location-dot"></i> ${meeting.location}</span>
            ${meeting.participants ? `<span><i class="fa-solid fa-users"></i> ${meeting.participants}</span>` : ''}
          </div>
        </div>
        <div class="timeline-actions">
          <a class="btn btn-outline btn-sm view-details-btn" href="./archive/${meetingSlug(meeting)}.html">
            詳細を見る <i class="fa-solid fa-chevron-right"></i>
          </a>
        </div>
      </div>
    </div>`;
}

// 新しい順に並べた一覧
export function timelineHtml(meetings) {
  return [...meetings].reverse().map(timelineItemHtml).join('\n');
}
