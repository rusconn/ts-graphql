# ts-graphql

TypeScriptによるGraphQL APIの実装例。公開APIの想定。

## 必要なツール

- [mise](https://mise.jdx.dev/)
- [pgschema](https://www.pgschema.com/)
- 互換性のあるコンテナランタイム
- Compose仕様V2準拠CLI(Docker Compose/Podman Compose等)

[mise管理のツール](mise.toml)は自動でインストールされる。

## 初回セットアップ

```sh
mise run setup
```

## devサーバー起動

```sh
mise run dev
```

クエリの実行は[Webコンソール](http://localhost:4000/graphql)で。\
アクセストークンをAuthorizationヘッダへBearerでセットしておくこと。\
アクセストークンはWebコンソールでloginミューテーションを実行して手に入れる。\
ログインに必要な情報は[seedスクリプト](./db/seed.minimal.ts)から取得する。

## 主なトピック

**設計**

- レイヤードアーキテクチャ(domain/application/infrastructure/presentation)
- Unit of Workパターン

**認証・認可**

- JWT認証(短命アクセストークン＋長命リフレッシュトークン)
- リフレッシュトークンローテーション、マルチデバイスセッション
- リフレッシュトークン再利用検知・強制ログアウト
- ロールベースアクセス制御

**GraphQL**

- GraphQL Server Specification(Object Identification/Cursor Connections)
- Unionベースのエラー型設計、フィールド定義のコロケーション
- クエリの制限(トークン数・エイリアス数・深さ・ノード数・複雑さ)
- トークンバケット式レートリミット
- DataloaderによるN+1対策

**DB**

- PostgreSQL+Kysely、UUID v7
- pgschemによる宣言的マイグレーション
- pg_bigmによる全文検索(部分一致ベース)

**HTTP**

- リクエストタイムアウト
- アイドルタイムアウト
- ボディサイズ制限

**テスト**

- UT/IT/E2Eの3段階テスト

**開発環境**

- miseによるツール・タスク管理
  - タスクの依存関係と並列実行
  - ネイティブバイナリとキャッシュによる高速なチェック
