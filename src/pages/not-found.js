/*
  存在しないURLを開いたときの画面
*/
export function renderNotFound() {
  return `
    <h1>ページが見つかりません</h1>
    <p class="note">URLが間違っているかもしれません。</p>
    <p><a href="#/">トップへ戻る</a></p>
  `;
}
