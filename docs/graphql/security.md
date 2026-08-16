# GraphQL Security

公開APIのためPersisted Queries専用にできない。

## クエリの制限

[GraphQL Armor](https://escape.tech/graphql-armor/)と[graphql-query-complexity](https://github.com/slicknode/graphql-query-complexity)を組み合わせている。

GraphQL Armorは基本的なセキュリティを提供してくれるが、クエリの複雑さを考慮したものは提供しないので、graphql-query-complexityで補っている。

### クエリの複雑さ目安

根拠なし。感覚で決めた。

| フィールドの種類                           |     複雑さ |
| :----------------------------------------- | ---------: |
| DBアクセスを伴わないもの                   |          1 |
| DBアクセスを伴うもの                       |          3 |
| 通常のミューテーション                     |         50 |
| Argon2id等の重い計算を伴うミューテーション |       1000 |
| connection                                 | 3 \* count |

### 複数形親フィールド以下の複雑さ

複数形親(connection等)の指定件数を文脈として持ち、子の複雑さへ件数を乗算する方式を採っている。

例: `{ foos(first: 30) { nodes { bars(first: 50) { nodes { id } } } } }`

- `foos`: 3×1 = 3
- `bars`: 3×30 = 90
- `id`: 1×30×50 = 1500
- 合計 ≈ 1595

`totalCount`や`pageInfo`等、親が複数形でも複数にならないものは親の乗算をオプトアウトするようにしている。

例: `{ foos(first: 30) { nodes { bars(first: 50) { totalCount } } } }`

- `foos`: 3×1 = 3
- `bars`: 3×30 = 90
- `totalCount`: 5×30 = 150
- 合計 ≈ 243

## レートリミット

トークンバケット方式でcomplexity分を消費していく。バケットソースが利用できない場合でもfail-openで受け入れる。

### signupRequest

メール送信の濫用を防ぐため、`signupRequest`は専用のper-IPレートリミッターを持つ。\
分散攻撃による濫用は防げない。

## リフレッシュトークンの再利用検知

使用済みのリフレッシュトークンが再送された場合、窃盗の可能性があるためユーザーの全リフレッシュトークンを失効させる。\
レートリミットと同様、検知ソースが利用できない場合はfail-openで受け入れる。
