/*
  トップ画面（#/）
  ステップ1では「データが読めているか」と「画面が切り替わるか」を確かめるための仮の画面。
  本番の見た目はステップ2で作る。
*/
import { getEvents, getFacilities } from '../data/index.js';

export async function renderTop() {
  const events = await getEvents();
  const facilities = await getFacilities();

  // 動作確認用に、最初の5件だけリンクにする
  const links = events
    .slice(0, 5)
    .map(
      (ev) => `
        <li><a href="#/event/${ev.id}">${ev.date}　${ev.title}</a></li>`
    )
    .join('');

  return `
    <h1>トップ（仮）</h1>
    <p class="note">施設 ${facilities.length} か所／イベント ${events.length} 件を読み込みました。</p>
    <h2>イベント（最初の5件）</h2>
    <ul class="link-list">${links}</ul>
  `;
}
