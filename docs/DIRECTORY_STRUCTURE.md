# ディレクトリ構造詳細

## 📂 プロジェクト全体構造

```
ca27-people/
├── app/                      # Next.js 16 App Router
├── components/               # React コンポーネント
├── lib/                      # ユーティリティ・設定
├── public/                   # 静的ファイル
├── docs/                     # ドキュメント
├── .env.local               # 環境変数（Git管理外）
├── .env.example             # 環境変数サンプル
├── .gitignore               # Git除外設定
├── next.config.ts           # Next.js設定
├── package.json             # 依存パッケージ
├── tailwind.config.ts       # Tailwind CSS設定
├── tsconfig.json            # TypeScript設定
└── README.md                # プロジェクト説明
```

---

## 📁 app/ - Next.js App Router

Next.js 16のApp Routerを使用。各フォルダがルートに対応。

```
app/
├── page.tsx                 # / - トップページ（プロフィール一覧）
├── layout.tsx               # 全ページ共通レイアウト
├── globals.css              # グローバルスタイル
├── login/
│   └── page.tsx            # /login - ログインページ
├── profile/
│   ├── [id]/
│   │   └── page.tsx        # /profile/:id - プロフィール詳細
│   └── edit/
│       └── page.tsx        # /profile/edit - プロフィール編集
├── posts/
│   ├── page.tsx            # /posts - ニュース一覧
│   ├── [id]/
│   │   └── page.tsx        # /posts/:id - 記事詳細
│   └── new/
│       └── page.tsx        # /posts/new - 新規投稿
├── events/
│   ├── page.tsx            # /events - イベント一覧
│   ├── [id]/
│   │   └── page.tsx        # /events/:id - イベント詳細
│   └── new/
│       └── page.tsx        # /events/new - イベント作成
└── admin/
    └── page.tsx            # /admin - 管理画面
```

### 主要ページの役割

#### `page.tsx` (トップページ)
- プロフィール一覧表示
- 職種フィルター（ビジネス/エンジニア/デザイナー）
- 事業部検索
- タグ検索
- ログイン認証チェック

#### `profile/[id]/page.tsx` (プロフィール詳細)
- プロフィール情報表示
- 写真スライダー
- QRコード生成
- コメント機能
- 編集ボタン（本人のみ）

#### `profile/edit/page.tsx` (プロフィール編集)
- 基本情報編集
- 複数写真アップロード（最大5枚）
- 進捗バー表示
- パスワード変更

---

## 🧩 components/ - Reactコンポーネント

再利用可能なUIコンポーネント

```
components/
├── Header.tsx              # ヘッダー（ナビゲーション）
├── ProfileCard.tsx         # プロフィールカード（一覧表示用）
├── ProfileComments.tsx     # コメント機能
├── ProfileProgress.tsx     # 進捗バー
├── PhotoSlider.tsx         # 写真スライダー
├── QRCodeModal.tsx         # QRコードモーダル
├── NotificationBell.tsx    # 通知ベル
├── NewsCard.tsx            # ニュースカード
└── EventCard.tsx           # イベントカード
```

### コンポーネント詳細

#### `ProfileCard.tsx`
- **用途**: プロフィール一覧での1枚のカード表示
- **表示内容**: 写真、名前、タグ（最大3個）
- **Props**: `{ profile: Profile }`

#### `ProfileComments.tsx`
- **用途**: プロフィール詳細ページのコメントセクション
- **機能**: コメント投稿、削除、通知作成
- **Props**: `{ profileId: string, profileUserId: string }`

#### `PhotoSlider.tsx`
- **用途**: 複数写真のスライダー表示
- **機能**: 左右ナビゲーション、ドットインジケーター、写真カウンター
- **Props**: `{ photos: string[], userName: string, size?: 'small' | 'medium' | 'large' }`

#### `QRCodeModal.tsx`
- **用途**: QRコード表示とダウンロード
- **機能**: QRコード生成、PNG保存
- **Props**: `{ isOpen: boolean, onClose: () => void, url: string, userName: string }`

#### `NotificationBell.tsx`
- **用途**: ヘッダーの通知アイコン
- **機能**: 未読数表示、通知一覧、既読処理
- **Props**: なし（localStorageからユーザー情報取得）

#### `ProfileProgress.tsx`
- **用途**: プロフィール完成度表示
- **機能**: ％計算、未入力項目リスト
- **Props**: `{ profile: Profile }`

---

## 🛠️ lib/ - ユーティリティ・設定

```
lib/
├── supabase.ts             # Supabase接続設定
├── types.ts                # TypeScript型定義
├── constants.ts            # 定数定義
└── textFormatter.ts        # テキスト整形ユーティリティ
```

### ファイル詳細

#### `supabase.ts`
```typescript
// Supabaseクライアントの初期化
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

#### `types.ts`
主要な型定義：
- `Profile` - プロフィール情報
- `Post` - 投稿情報
- `Event` - イベント情報
- `Notification` - 通知情報
- `ProfileComment` - コメント情報

#### `constants.ts`
定数定義：
- `ROLES` - 職種リスト（ビジネス/エンジニア/デザイナー）
- `DEPARTMENT_OPTIONS` - 事業部リスト（階層構造）
- `MBTI_TYPES` - MBTI性格タイプ

#### `textFormatter.ts`
テキスト整形機能：
- マークダウン風記法のHTML変換
- URLリンク化
- 改行処理

---

## 🖼️ public/ - 静的ファイル

```
public/
├── favicon.ico             # ファビコン
└── images/                 # 画像ファイル
```

---

## 📚 docs/ - ドキュメント

```
docs/
├── DATABASE.md             # データベース設計
├── DIRECTORY_STRUCTURE.md  # このファイル
└── FEATURES.md             # 機能一覧
```

---

## 🔧 設定ファイル

### `next.config.ts`
Next.js設定：
- 画像最適化
- 環境変数
- ビルド設定

### `tailwind.config.ts`
Tailwind CSS設定：
- カスタムカラー（primary, secondary, cream, dark）
- フォント設定
- レスポンシブブレークポイント

### `tsconfig.json`
TypeScript設定：
- パスエイリアス（`@/`）
- strictモード有効

---

## 📦 主要な依存パッケージ

### 実行時依存
```json
{
  "next": "^16.0.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "@supabase/supabase-js": "^2.x",
  "lucide-react": "^0.x",
  "qrcode": "^1.x",
  "tailwindcss": "^4.x"
}
```

### 開発時依存
```json
{
  "typescript": "^5.x",
  "@types/node": "^20.x",
  "@types/react": "^19.x",
  "@types/qrcode": "^1.x"
}
```

---

## 🔐 セキュリティ注意事項

### Git管理から除外すべきファイル
- `.env.local` - 環境変数（機密情報）
- `node_modules/` - 依存パッケージ
- `.next/` - ビルド成果物

### 環境変数の管理
1. **開発環境**: `.env.local`
2. **本番環境**: Vercelの環境変数設定
3. **共有用**: `.env.example`（機密情報を含まないサンプル）

---

## 🚀 ビルド・デプロイ

### 開発サーバー
```bash
npm run dev
```

### 本番ビルド
```bash
npm run build
```

### 本番サーバー起動
```bash
npm run start
```

---

## 📝 命名規則

### ファイル名
- **Reactコンポーネント**: PascalCase（例: `ProfileCard.tsx`）
- **ページ**: `page.tsx`
- **ユーティリティ**: camelCase（例: `textFormatter.ts`）

### 変数・関数名
- **変数**: camelCase（例: `userName`）
- **定数**: UPPER_SNAKE_CASE（例: `DEPARTMENT_OPTIONS`）
- **コンポーネント**: PascalCase（例: `ProfileCard`）
- **関数**: camelCase（例: `fetchProfile`）

---

## 🎨 スタイルガイド

### カラーパレット
```css
--primary: #FF6B35;      /* オレンジ */
--secondary: #F7931E;    /* 明るいオレンジ */
--cream: #FFF5E6;        /* クリーム */
--dark: #2C3E50;         /* ダークグレー */
```

### レスポンシブブレークポイント
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

---

この構造を理解することで、プロジェクトの全体像を把握し、効率的に開発を進めることができます。