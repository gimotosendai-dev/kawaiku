/*
  イベント詳細画面（#/event/:id）
  ステップ1では、URL の ID でイベントが取り出せるかを確かめる仮の画面。
  本番の見た目はステップ3で作る。
*/
import { getEventById, getFacilityById } from '../data/index.js';

// params.id に URL の「ev001」の部分が入ってくる
export async function renderEvent(params) {
  const ev = await getEventById(params.id);

  if (!ev) {
    return `
      <h1>イベントが見つかりません</h1>
      <p class="note">ID：${params.id}</p>
      <p><a href="#/">トップへ戻る</a></p>
    `;
  }

  const facility = await getFacilityById(ev.facility_id);
  // 施設の色（例：mint）から、tokens.css の変数名を組み立てる
  const color = facility?.color ?? 'mint';

  return `
    <h1>イベント詳細（仮）</h1>
    <div class="card">
      <span class="facility-tag"
        style="background: var(--facility-${color}); color: var(--facility-${color}-strong);">
        ${facility?.name ?? ev.facility_id}
      </span>
      <h2>${ev.title}</h2>
      <p>${ev.date}　${ev.start_time ?? ''}〜${ev.end_time ?? ''}</p>
      <p class="note">ID：${ev.id}</p>
    </div>
    <p><a href="#/">トップへ戻る</a></p>
  `;
}
