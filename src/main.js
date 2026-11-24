/*
  画面の切り替え（ハッシュルーティング）
  URL の「#」より後ろを見て、どの画面を表示するかを決める。
    #/              → トップ
    #/event/ev001   → イベント詳細（ev001 がイベントのID）
  「#」より後ろが変わってもページの再読み込みは起きないので、切り替えが速い。
*/
import { renderTop } from './pages/top.js';
import { renderEvent } from './pages/event.js';
import { renderNotFound } from './pages/not-found.js';

// 画面を描く場所（index.html の <main id="app">）
const app = document.getElementById('app');

// URL の形と、そのとき使う画面の関数の対応表
// :id の部分は何でもよく、画面の関数に params.id として渡される
const routes = [
  { path: '/', render: renderTop },
  { path: '/event/:id', render: renderEvent },
];

/**
 * 今のURLの形が、対応表の path に合うか調べる
 * 合えば { id: 'ev001' } のような値を、合わなければ null を返す
 */
function matchRoute(routePath, currentPath) {
  const routeParts = routePath.split('/');
  const currentParts = currentPath.split('/');
  if (routeParts.length !== currentParts.length) return null;

  const params = {};
  for (let i = 0; i < routeParts.length; i++) {
    if (routeParts[i].startsWith(':')) {
      // :id のような部分は、その位置の文字を値として取り出す
      params[routeParts[i].slice(1)] = decodeURIComponent(currentParts[i]);
    } else if (routeParts[i] !== currentParts[i]) {
      return null;
    }
  }
  return params;
}

/** 今のURLに合わせて画面を描き直す */
async function router() {
  // 「#/event/ev001」→「/event/ev001」。「#」がなければトップ扱い
  // 「?」以降（#/events?genre=play など）は今は使わないので切り離す
  const hash = location.hash.slice(1) || '/';
  const path = hash.split('?')[0];

  for (const route of routes) {
    const params = matchRoute(route.path, path);
    if (params) {
      app.innerHTML = await route.render(params);
      window.scrollTo(0, 0); // 画面が変わったら一番上から表示
      return;
    }
  }
  app.innerHTML = renderNotFound();
}

// 「#」より後ろが変わったとき、最初に開いたときに画面を描く
window.addEventListener('hashchange', router);
router();
