/*
  イベントのジャンル（docs/03_データ設計.md の「ジャンル（category）」）
  icon は写真がないときに出す仮のアイコン。後で制作者のイラストに差し替える。
*/
export const CATEGORIES = {
  open: { label: '開放・自由あそび', icon: '🧸' },
  play: { label: '親子あそび', icon: '🎵' },
  craft: { label: '製作', icon: '✂️' },
  exercise: { label: '運動・ヨガ', icon: '🤸' },
  care: { label: 'ケア', icon: '🌿' },
  course: { label: '講座・お話', icon: '📖' },
  food: { label: '食育・クッキング', icon: '🍙' },
  consult: { label: '相談', icon: '💬' },
  birthday: { label: 'お誕生会', icon: '🎂' },
  outing: { label: 'おでかけ', icon: '🍂' },
  info: { label: 'お知らせ', icon: '📢' },
};

/** ジャンルの値から表示用の情報を取り出す（知らない値なら「その他」） */
export function getCategory(value) {
  return CATEGORIES[value] ?? { label: 'その他', icon: '⭐' };
}
