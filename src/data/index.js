/*
  データ読み込み関数
  画面のコードは、データが必要なときに必ずここの関数を使う。
  （JSONファイルを直接読まない）

  今は data/*.json（ダミーデータ）を読んでいる。
  後で Supabase に切り替えるときは、このファイルの中身だけを書き換えれば、
  画面のコードは変えなくて済む。
  そのため、すべての関数を async（結果を待ってから使う形）にしている。
  使い方：const events = await getEvents();
*/

// JSONファイルを読み込む（Vite が JSON をそのまま JavaScript のデータにしてくれる）
import facilitiesJson from '../../data/facilities.json';
import eventsJson from '../../data/events.json';
// notices.json には「お知らせ」「臨時休所」「おたより」の3つが入っている
import noticesJson from '../../data/notices.json';

/** 施設の一覧 */
export async function getFacilities() {
  return facilitiesJson.facilities;
}

/** 施設を1つ取り出す（見つからなければ null） */
export async function getFacilityById(id) {
  return facilitiesJson.facilities.find((f) => f.id === id) ?? null;
}

/**
 * イベントの一覧
 * 公開中（published）と中止（cancelled）だけを返す。下書き（draft）は利用者に見せない。
 * （Supabase では同じことを RLS というしくみで制御する）
 */
export async function getEvents() {
  return eventsJson.events.filter((e) => e.status !== 'draft');
}

/** イベントを1つ取り出す（見つからなければ null） */
export async function getEventById(id) {
  const events = await getEvents();
  return events.find((e) => e.id === id) ?? null;
}

/** お知らせの一覧 */
export async function getNotices() {
  return noticesJson.notices;
}

/** お知らせを1つ取り出す（見つからなければ null） */
export async function getNoticeById(id) {
  return noticesJson.notices.find((n) => n.id === id) ?? null;
}

/** 臨時休所の一覧 */
export async function getClosures() {
  return noticesJson.closures;
}

/** おたよりの一覧 */
export async function getNewsletters() {
  return noticesJson.newsletters;
}

/** おたよりを1つ取り出す（見つからなければ null） */
export async function getNewsletterById(id) {
  return noticesJson.newsletters.find((n) => n.id === id) ?? null;
}
