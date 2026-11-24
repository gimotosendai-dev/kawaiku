/*
  表示用の文字づくり（docs/04_デザインルール.md の「表示のきまり」）
*/

/**
 * 文字を HTML として安全に表示できる形にする
 * 例：「<」を「&lt;」に変える。
 * 後で施設の職員が入力した文字を表示するとき、
 * 文字の中に HTML のタグが入っていても画面が壊れたり、悪用されたりしないようにする。
 * 画面に出すデータの文字には必ずこれを通す。
 */
export function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** 月齢1つを文字にする：5 →「5か月」、12 →「1歳」、14 →「1歳2か月」 */
function formatMonths(months) {
  if (months < 12) return `${months}か月`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest === 0 ? `${years}歳` : `${years}歳${rest}か月`;
}

/**
 * 対象月齢の表示
 *   null / null → どなたでも
 *   0 / 11      → 0〜11か月（どちらも1歳未満なら「か月」は最後だけ）
 *   12 / null   → 1歳〜
 *   14 / null   → 1歳2か月〜
 *   12 / 71     → 1歳〜5歳11か月
 */
export function formatAge(min, max) {
  // 0か月から上限なし ＝ 年齢を問わないのと同じ
  if ((min === null || min === 0) && max === null) return 'どなたでも';
  if (min !== null && max !== null && min < 12 && max < 12) {
    return `${min}〜${max}か月`;
  }
  const from = min !== null ? formatMonths(min) : '';
  const to = max !== null ? formatMonths(max) : '';
  return `${from}〜${to}`;
}

/** 料金：0 →「無料」、null →「料金は当日ご確認ください」、500 →「500円」 */
export function formatFee(yen) {
  if (yen === null || yen === undefined) return '料金は当日ご確認ください';
  if (yen === 0) return '無料';
  return `${yen.toLocaleString()}円`;
}

/** 定員：7 →「定員7組」、null → 空（表示しない） */
export function formatCapacity(capacity) {
  return capacity ? `定員${capacity}組` : '';
}
