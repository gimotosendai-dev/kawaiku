/*
  日付と時間の計算・表示
  日付は「2026-11-25」のような文字列で扱う（データと同じ形）。
*/

/** Date を「2026-11-25」の形の文字列にする */
function toDateString(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0'); // 1桁なら前に0を付ける
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 「2026-11-25」を Date にする（時差でずれないよう、日本の日付として作る） */
function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * 「今日」の日付
 * URL に ?date=2026-11-25 が付いていれば、その日を今日として扱う（デモ・確認用）。
 * 付いていなければ、実際の今日。
 */
export function getToday() {
  const param = new URLSearchParams(location.search).get('date');
  if (param && /^\d{4}-\d{2}-\d{2}$/.test(param)) {
    return param;
  }
  return toDateString(new Date());
}

/** ?date= で「今日」を変えているかどうか */
export function isDemoDate() {
  return new URLSearchParams(location.search).has('date');
}

/** 日付に n 日足す（n がマイナスなら戻る） */
export function addDays(dateStr, n) {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + n);
  return toDateString(d);
}

/** 「2026-11-25」→「11月25日（水）」 */
export function formatDate(dateStr) {
  const d = parseDate(dateStr);
  const week = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
  return `${d.getMonth() + 1}月${d.getDate()}日（${week}）`;
}

/** 「10:30」「11:30」→「10:30〜11:30」 */
export function formatTimeRange(start, end) {
  if (!start) return '';
  return end ? `${start}〜${end}` : `${start}〜`;
}

/** 「2026-11」→「11月」 */
export function formatMonth(monthStr) {
  return `${Number(monthStr.split('-')[1])}月`;
}

/**
 * 時刻を「0時からの分」に直す（並べ替え用）
 * データには「9:50」と「10:30」のように桁数が違う時刻があり、
 * 文字のまま比べると順番がおかしくなるため。
 */
export function timeToMinutes(time) {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** イベントを日付 → 開始時刻の順に並べる（元の配列は変えない） */
export function sortEvents(events) {
  return [...events].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return timeToMinutes(a.start_time) - timeToMinutes(b.start_time);
  });
}
