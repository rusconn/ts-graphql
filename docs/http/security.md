# HTTP Security

- TLS終端なし(前段任せ)
- 各種上限を設定
  - 同時接続数
  - リクエスト受信時間
  - アイドル時間
  - リクエストボディサイズ
- CORSはしていない
- CSRF対策としてrefresh token cookieへ`SameSite=Lax`を設定
  - CORSするなら設定を緩くし、別で対策する
