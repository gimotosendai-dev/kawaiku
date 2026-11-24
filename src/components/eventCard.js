/*
  イベントカード（docs/04_デザインルール.md の「部品」）
  上部に施設色の帯＋施設名、写真（なければジャンルのアイコン）、
  イベント名、日時、タグ（対象月齢・要予約・定員・駐車場混雑）。
  カード全体がイベント詳細へのリンク。
*/
import { esc, formatAge, formatCapacity } from '../utils/format.js';
import { formatDate, formatTimeRange } from '../utils/date.js';
import { getCategory } from '../utils/category.js';

/**
 * @param event    イベント1件
 * @param facility そのイベントの施設（見つからなければ null）
 * @param options  showDate: 日付も出すか（今日のイベントでは時間だけでよいので false）
 */
export function renderEventCard(event, facility, { showDate = true } = {}) {
  const category = getCategory(event.category);
  // 施設の色名（mint など）。CSS の .fc-mint などのクラスで色が決まる
  const color = facility?.color ?? 'mint';

  // 写真があれば写真、なければジャンルのアイコン
  const visual = event.image_url
    ? `<img class="event-card__img" src="${esc(event.image_url)}" alt="" />`
    : `<div class="event-card__icon" aria-hidden="true">${category.icon}</div>`;

  // タグは、値があるものだけ並べる
  const tags = [];
  if (event.status === 'cancelled') tags.push('<span class="tag tag--cancel">中止</span>');
  tags.push(`<span class="tag">${esc(formatAge(event.min_age_months, event.max_age_months))}</span>`);
  if (event.reservation_required) tags.push('<span class="tag tag--strong">要予約</span>');
  const capacity = formatCapacity(event.capacity);
  if (capacity) tags.push(`<span class="tag">${esc(capacity)}</span>`);
  if (event.parking_busy) tags.push('<span class="tag tag--warn">駐車場混雑</span>');

  const when = showDate
    ? `${formatDate(event.date)} ${formatTimeRange(event.start_time, event.end_time)}`
    : formatTimeRange(event.start_time, event.end_time);

  return `
    <a class="event-card fc-${esc(color)}" href="#/event/${encodeURIComponent(event.id)}">
      <div class="event-card__band">${esc(facility?.name ?? '')}</div>
      ${visual}
      <div class="event-card__body">
        <p class="event-card__title">${esc(event.title)}</p>
        <p class="event-card__when">${esc(when)}</p>
        <div class="tags">${tags.join('')}</div>
      </div>
    </a>
  `;
}
