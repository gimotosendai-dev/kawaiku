/*
  トップ画面（#/）  docs/02_画面一覧.md の「1 トップ」
  ①ロゴ ②臨時休所の帯 ③今日のイベント（横スライド） ④近日のイベント（2列）
  ⑤お知らせ ⑥おたより ⑦支援センター一覧 ⑧フッター ＋ 下部ナビ
*/
import {
  getEvents,
  getFacilities,
  getNotices,
  getClosures,
  getNewsletters,
} from '../data/index.js';
import {
  getToday,
  isDemoDate,
  addDays,
  formatDate,
  formatMonth,
  sortEvents,
} from '../utils/date.js';
import { esc } from '../utils/format.js';
import { renderEventCard } from '../components/eventCard.js';
import { renderBottomNav } from '../components/bottomNav.js';

// ===== 表示の決まり（数字を変えれば表示が変わる） =====
// 「近日」とする日数（明日から何日先まで）
const UPCOMING_DAYS = 7;
// 近日のイベントを最初に何件出すか（「もっと見る」を押すたびに、この件数ずつ増える）
const UPCOMING_STEP = 8;
// 臨時休所の帯を、何日先の分まで出すか（今日を含む）
const CLOSURE_DAYS = 7;

export async function renderTop() {
  const today = getToday();

  // データをまとめて読み込む（Promise.all は「全部そろうまで待つ」）
  const [events, facilities, notices, closures, newsletters] = await Promise.all([
    getEvents(),
    getFacilities(),
    getNotices(),
    getClosures(),
    getNewsletters(),
  ]);

  // 施設IDから施設を探しやすくする対応表（{ sukusuku: {...}, ... }）
  const facilityMap = Object.fromEntries(facilities.map((f) => [f.id, f]));

  return `
    ${renderHeader(today)}
    ${renderClosureBand(closures, facilityMap, today)}
    ${renderTodayEvents(events, facilityMap, today)}
    ${renderUpcomingEvents(events, facilityMap, today)}
    ${renderNotices(notices, facilityMap, today)}
    ${renderNewsletters(newsletters, facilityMap, today)}
    ${renderFacilityList(facilities)}
    ${renderFooter()}
    ${renderBottomNav('home')}
  `;
}

/**
 * 画面を描いたあとに動かす処理（ボタンを押したときの動きなど）
 * main.js から、画面の HTML を入れた直後に呼ばれる。
 */
export function setupTop() {
  const button = document.getElementById('upcoming-more');
  if (!button) return; // 「もっと見る」がない（8件以下）ときは何もしない

  button.addEventListener('click', () => {
    // まだ隠れているカードのうち、先頭から UPCOMING_STEP 件を表示する
    const hiddenSlots = document.querySelectorAll('#upcoming-grid .card-slot[hidden]');
    [...hiddenSlots].slice(0, UPCOMING_STEP).forEach((slot) => {
      slot.hidden = false;
    });

    // 残りの件数を数え直す。なくなったらボタンを消す
    const rest = hiddenSlots.length - UPCOMING_STEP;
    if (rest > 0) {
      button.textContent = `もっと見る（残り${rest}件）`;
    } else {
      button.remove();
    }
  });
}

// ① ロゴ（仮の文字ロゴ。後で制作者のロゴに差し替える）
function renderHeader(today) {
  // ?date= で日付を変えているときは、それがわかるように表示する
  const demo = isDemoDate()
    ? `<p class="demo-date">確認用：${esc(formatDate(today))}を「今日」として表示中</p>`
    : '';
  return `
    <header class="site-header">
      <p class="logo">カワイク</p>
      <p class="logo-sub">薩摩川内 子育て支援センター情報</p>
      ${demo}
    </header>
  `;
}

// ② 臨時休所の帯（今日から数日先までの分）
function renderClosureBand(closures, facilityMap, today) {
  const until = addDays(today, CLOSURE_DAYS - 1);
  const items = closures
    .filter((c) => c.date >= today && c.date <= until)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  if (items.length === 0) return '';

  const lines = items
    .map((c) => {
      const name = facilityMap[c.facility_id]?.name ?? '';
      // 理由があれば「施設名：理由」、なければ「施設名はお休みです」
      const text = c.reason ? `${name}：${c.reason}` : `${name}はお休みです`;
      return `<li><strong>${esc(formatDate(c.date))}</strong> ${esc(text)}</li>`;
    })
    .join('');

  return `
    <section class="closure-band" aria-label="臨時休所のお知らせ">
      <p class="closure-band__title">臨時休所</p>
      <ul>${lines}</ul>
    </section>
  `;
}

// ③ 今日のイベント（横にスライドするカード）
function renderTodayEvents(events, facilityMap, today) {
  const list = sortEvents(events.filter((e) => e.date === today));
  const body =
    list.length === 0
      ? '<p class="empty">今日のイベントはありません。</p>'
      : `<div class="scroll-row">
          ${list.map((e) => renderEventCard(e, facilityMap[e.facility_id], { showDate: false })).join('')}
        </div>`;
  return `
    <section class="section">
      <h2>今日のイベント <span class="h2-sub">${esc(formatDate(today))}</span></h2>
      ${body}
    </section>
  `;
}

// ④ 近日のイベント（2列のカード）
function renderUpcomingEvents(events, facilityMap, today) {
  const from = addDays(today, 1);
  const until = addDays(today, UPCOMING_DAYS);
  const all = sortEvents(events.filter((e) => e.date >= from && e.date <= until));

  // カードは全部作っておき、最初の UPCOMING_STEP 件より後ろは hidden（隠す）にする。
  // 「もっと見る」を押すと、setupTop の処理で hidden を外して表示する。
  const cards = all
    .map((e, i) => {
      const card = renderEventCard(e, facilityMap[e.facility_id]);
      return i < UPCOMING_STEP ? card : `<div class="card-slot" hidden>${card}</div>`;
    })
    .join('');

  const body =
    all.length === 0
      ? '<p class="empty">近日のイベントはありません。</p>'
      : `<div class="card-grid" id="upcoming-grid">${cards}</div>`;

  const rest = all.length - UPCOMING_STEP;
  const more =
    rest > 0
      ? `<button type="button" class="more-button" id="upcoming-more">
          もっと見る（残り${rest}件）
        </button>`
      : '';

  return `
    <section class="section">
      <h2>近日のイベント</h2>
      ${body}
      ${more}
    </section>
  `;
}

// ⑤ お知らせ（掲載期間中のもの。新しい順）
function renderNotices(notices, facilityMap, today) {
  const list = notices
    .filter((n) => n.published_on <= today && (!n.expires_on || n.expires_on >= today))
    .sort((a, b) => (a.published_on < b.published_on ? 1 : -1));
  if (list.length === 0) return '';

  const items = list
    .map((n) => {
      const facility = facilityMap[n.facility_id];
      return `
        <li>
          <a class="list-link" href="#/notice/${encodeURIComponent(n.id)}">
            <span class="dot fc-${esc(facility?.color ?? 'mint')}" aria-hidden="true"></span>
            <span>
              <span class="list-link__sub">${esc(facility?.name ?? '')}</span>
              ${esc(n.title)}
            </span>
          </a>
        </li>`;
    })
    .join('');

  return `
    <section class="section">
      <h2>お知らせ</h2>
      <ul class="plain-list">${items}</ul>
    </section>
  `;
}

// ⑥ おたより（施設ごとに、今月までの一番新しい号）
function renderNewsletters(newsletters, facilityMap, today) {
  const thisMonth = today.slice(0, 7); // 「2026-11-25」→「2026-11」
  const latest = {};
  for (const n of newsletters) {
    if (n.month > thisMonth) continue; // 来月以降の号はまだ出さない
    if (!latest[n.facility_id] || latest[n.facility_id].month < n.month) {
      latest[n.facility_id] = n;
    }
  }
  const list = Object.values(latest);
  if (list.length === 0) return '';

  const items = list
    .map((n) => {
      const facility = facilityMap[n.facility_id];
      return `
        <a class="chip fc-${esc(facility?.color ?? 'mint')}" href="#/newsletter/${encodeURIComponent(n.id)}">
          ${esc(facility?.name ?? '')} ${esc(formatMonth(n.month))}号
        </a>`;
    })
    .join('');

  return `
    <section class="section">
      <h2>おたより</h2>
      <div class="chip-list">${items}</div>
    </section>
  `;
}

// ⑦ 支援センター一覧（施設色の丸＋施設名＋開所時間＋電話ボタン）
function renderFacilityList(facilities) {
  const items = facilities
    .map(
      (f) => `
      <li class="facility-row">
        <a class="facility-row__main" href="#/facility/${encodeURIComponent(f.id)}">
          <span class="dot dot--lg fc-${esc(f.color)}" aria-hidden="true"></span>
          <span>
            <span class="facility-row__name">${esc(f.name)}</span>
            <span class="list-link__sub">${esc(f.open_time)}〜${esc(f.close_time)}</span>
          </span>
        </a>
        <a class="tel-button" href="tel:${esc(f.phone)}" aria-label="${esc(f.name)}に電話する">📞 電話</a>
      </li>`
    )
    .join('');

  return `
    <section class="section">
      <h2>支援センター</h2>
      <ul class="plain-list">${items}</ul>
    </section>
  `;
}

// ⑧ フッター（各ページはステップ4以降で作る）
function renderFooter() {
  return `
    <footer class="site-footer">
      <a href="#/terms">利用規約</a>
      <a href="#/privacy">プライバシーポリシー</a>
      <a href="#/faq">よくある質問</a>
      <a href="#/contact">お問い合わせ</a>
      <p class="note">掲載内容は各センターのおたよりを元にしています。最新情報は各センターにご確認ください。</p>
    </footer>
  `;
}
