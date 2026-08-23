# Architecture

## 構成と依存方向

```
src/app (composition root)
  │  ← modules/*/app.ts, modules/*/mod.tsを利用
  ▼
src/modules/<module-name>
  │   ├─ presentation  → src/appへの参照を許可 (Context型等)
  │   ├─ application
  │   ├─ domain
  │   └─ infrastructure
  ▼
src/modules/shared (全モジュール共用。appへは依存しない)
  ▼
src/lib (汎用ロジック。modules,appに依存しない)
```

依存は常に下向き。例外的にpresentation層のみsrc/appを参照できるが、\
これはGraphQL Context型やauthorizerといったグルーの必要性による許容。

## 依存ルールの強制

機械的な強制は[oxlintの設定](../.oxlintrc.jsonc)で表現している。

## モジュールのエントリポイント

各モジュールは用途別に3つのエントリポイントを持つ。

### `mod.ts` — 他モジュール向け公開API

- 他のモジュールから必要なもの
- 例: domainエンティティ、applicationのエラー、parser、authorizer

### `app.ts` — composition root専用

- app固有のワイヤリング素材(`mod.ts`では足りない分)
- `mod.ts`をappの需要で膨らませず、モジュール間公開APIの面積を最小に保つ
- 例: 具象実装、DI用インターフェース、DTO

### `test.ts` — テスト用フィクスチャ

- 他モジュールのテストからのみ参照可。プロダクトコードからの参照はしない
