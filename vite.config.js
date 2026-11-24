// Vite（開発サーバー）の設定ファイル
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    // Codespaces など「外のパソコン」から開発サーバーを開けるようにする
    host: true,
    port: 5173,
    // Codespaces の公開URL（〜.app.github.dev）からのアクセスを許可する
    allowedHosts: ['.app.github.dev'],
  },
});
