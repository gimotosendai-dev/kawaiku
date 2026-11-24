/*
  画面下のナビ（ホーム／さがす／予約一覧）
  「さがす」はステップ5、「予約一覧」はフェーズ2で作るので、今は押せない「準備中」の表示。
  @param current 今いる画面（'home' など）。その項目を強調する
*/
export function renderBottomNav(current = 'home') {
  return `
    <nav class="bottom-nav" aria-label="メインメニュー">
      <a class="bottom-nav__item ${current === 'home' ? 'is-current' : ''}" href="#/">
        <span class="bottom-nav__icon" aria-hidden="true">🏠</span>ホーム
      </a>
      <span class="bottom-nav__item is-disabled" aria-disabled="true">
        <span class="bottom-nav__icon" aria-hidden="true">🔍</span>さがす（準備中）
      </span>
      <span class="bottom-nav__item is-disabled" aria-disabled="true">
        <span class="bottom-nav__icon" aria-hidden="true">📅</span>予約一覧（準備中）
      </span>
    </nav>
  `;
}
