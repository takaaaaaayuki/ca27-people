# MeetS - CA27同期プロフィールサイト

CA27同期のメンバーが互いを知り、つながるためのプロフィール共有プラットフォーム

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat&logo=vercel)](https://meets-27.vercel.app/)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2016-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![Database](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)

## 🌟 主な機能

### プロフィール機能
- **詳細なプロフィール作成**: 経歴、趣味、目標などを自由に記述
- **複数写真アップロード**: 最大5枚の写真をスライダー形式で表示
- **進捗バー**: プロフィール完成度をリアルタイム表示
- **QRコード生成**: プロフィールを簡単にシェア
- **タグ機能**: 自分を表すキーワードで個性をアピール

### コミュニケーション機能
- **プロフィールコメント**: メンバー同士でコメントを残せる
- **通知システム**: コメントが来たらリアルタイム通知
- **ニュース・ブログ投稿**: メンバー向けの情報発信

### イベント機能
- **イベント作成・管理**: 同期イベントの開催と参加管理
- **カレンダー表示**: イベントスケジュールを一目で確認

### 検索・フィルター
- **職種別フィルター**: ビジネス/エンジニア/デザイナー
- **事業部検索**: 興味のある事業部でメンバーを探す
- **タグ検索**: 共通の趣味や興味を持つメンバーを発見

### セキュリティ
- **ログイン認証**: 全ページでログイン必須
- **パスワード変更**: プロフィール編集から変更可能
- **ゲストアカウント**: 閲覧専用アカウント対応

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**

### バックエンド・インフラ
- **Supabase** (PostgreSQL)
  - 認証
  - データベース
  - ストレージ (画像アップロード)
- **Vercel** (ホスティング)

### 主要ライブラリ
- `lucide-react` - アイコン
- `qrcode` - QRコード生成
- `date-fns` - 日時処理

## 📦 セットアップ

### 前提条件
- Node.js 18.x 以上
- npm または yarn
- Supabaseアカウント

### インストール

1. **リポジトリのクローン**
```bash
git clone https://github.com/takaaaaaayuki/ca27-people.git
cd ca27-people
```

2. **依存パッケージのインストール**
```bash
npm install
```

3. **環境変数の設定**

`.env.local` ファイルを作成（`.env.example`を参考に）:
```bash
cp .env.example .env.local
```

以下の環境変数を設定:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **開発サーバーの起動**
```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

## 🗄️ データベース設定

### Supabaseテーブル構造

以下のテーブルが必要です：

#### `users`
- ユーザー認証情報

#### `profiles`
- プロフィール情報（名前、写真、経歴など）

#### `posts`
- ニュース・ブログ投稿

#### `events`
- イベント情報

#### `event_participants`
- イベント参加者

#### `profile_comments`
- プロフィールへのコメント

#### `profile_comment_likes`
- コメントへのいいね

#### `notifications`
- 通知情報

詳細なテーブル定義は `docs/DATABASE.md` を参照してください。

## 📁 プロジェクト構造

```
ca27-people/
├── app/                    # Next.js App Router
│   ├── page.tsx           # トップページ（プロフィール一覧）
│   ├── login/             # ログインページ
│   ├── profile/           # プロフィール関連
│   │   ├── [id]/         # プロフィール詳細
│   │   └── edit/         # プロフィール編集
│   ├── posts/            # ニュース・ブログ
│   └── events/           # イベント
├── components/           # 再利用可能なコンポーネント
│   ├── ProfileCard.tsx   # プロフィールカード
│   ├── ProfileComments.tsx # コメント機能
│   ├── NotificationBell.tsx # 通知ベル
│   ├── PhotoSlider.tsx   # 写真スライダー
│   └── ...
├── lib/                  # ユーティリティ・設定
│   ├── supabase.ts      # Supabase接続設定
│   ├── types.ts         # TypeScript型定義
│   ├── constants.ts     # 定数（事業部リストなど）
│   └── textFormatter.ts # テキスト整形
├── public/              # 静的ファイル
└── docs/                # ドキュメント
```

詳細なディレクトリ構造は `docs/DIRECTORY_STRUCTURE.md` を参照してください。

## 🚀 デプロイ

### Vercelへのデプロイ

1. GitHubリポジトリをVercelに接続
2. 環境変数を設定:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. デプロイ！

## 📝 開発の歴史

### 追加された主要機能（時系列）

1. **基本機能** (2026年1月)
   - プロフィール作成・編集
   - ログイン認証
   - 検索・フィルター

2. **QRコード機能** (2026年1月)
   - プロフィールQRコード生成
   - ダウンロード機能

3. **プロフィール進捗バー** (2026年1月)
   - 完成度％表示
   - 未入力項目の案内

4. **複数写真対応** (2026年1月)
   - 最大5枚の写真アップロード
   - スライダーUI
   - 並び替え機能

5. **コメント・通知機能** (2026年1月)
   - プロフィールへのコメント
   - リアルタイム通知

6. **セキュリティ強化** (2026年1月)
   - 全ページログイン必須化
   - パスワード変更機能

7. **UI改善** (2026年1月)
   - ProfileCardをタグ表示に変更
   - 事業部リストの追加（人事本部など）

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは社内利用を目的としています。

## 👥 開発チーム

- **開発者**: 樗木孝行（チシャキ タカユキ）
- **組織**: CyberAgent CA27同期

## 📞 お問い合わせ

質問や提案がある場合は、Issueを作成してください。

---

Made with ❤️ by CA27