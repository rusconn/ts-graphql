# Development Workflow

## 実装の流れ

実装内容によっては存在しないステップもある。

- 仕様を決める
- domain層を実装
- presentation層を設計
  - SDL用意
  - 上位モジュールへ配線
  - 型生成
- application層を実装
- infrastructure層を実装
- presentation層実装
  - タスクで型生成
  - resolverを実装
  - 上位モジュールへ配線

## コマンド実行ルール

- GraphQL schema編集後
  - `mise run gql:codegen`
- DB schema編集後
  - `mise run db:typegen`
- 作業終了時
  - `mise run fix`
  - `mise run test`
