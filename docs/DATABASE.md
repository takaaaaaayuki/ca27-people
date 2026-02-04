# データベース設計

## 🗄️ Supabaseテーブル構造

---

## テーブル一覧

1. [users](#users) - ユーザー認証情報
2. [profiles](#profiles) - プロフィール情報
3. [posts](#posts) - ニュース・ブログ投稿
4. [post_likes](#post_likes) - 投稿いいね
5. [post_comments](#post_comments) - 投稿コメント
6. [events](#events) - イベント情報
7. [event_participants](#event_participants) - イベント参加者
8. [profile_comments](#profile_comments) - プロフィールコメント
9. [profile_comment_likes](#profile_comment_likes) - プロフィールコメントいいね
10. [notifications](#notifications) - 通知情報

---

## users
ユーザー認証情報（ログイン用）

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

| カラム | 型 | 制約 | 説明 |
|--------|---|------|------|
| id | UUID | PRIMARY KEY | ユーザーID |
| email | TEXT | UNIQUE, NOT NULL | メールアドレス |
| password_hash | TEXT | NOT NULL | パスワードハッシュ |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

---

## profiles
プロフィール情報

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_romaji TEXT,
  nickname TEXT,
  birthday DATE,
  photo_url TEXT,
  photo_urls TEXT[],
  career TEXT,
  effort TEXT,
  goals TEXT,
  hobbies TEXT,
  reason_for_ca TEXT,
  interested_departments TEXT[],
  tags TEXT[],
  role TEXT DEFAULT 'business',
  mbti TEXT,
  sns_links JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

| カラム | 型 | 制約 | 説明 |
|--------|---|------|------|
| id | UUID | PRIMARY KEY | プロフィールID |
| user_id | UUID | FOREIGN KEY | ユーザーID |
| name | TEXT | NOT NULL | 名前（必須） |
| name_romaji | TEXT | | 名前（ローマ字） |
| nickname | TEXT | | あだ名 |
| birthday | DATE | | 誕生日 |
| photo_url | TEXT | | メイン写真URL |
| photo_urls | TEXT[] | | 複数写真URL（最大5枚） |
| career | TEXT | | 経歴 |
| effort | TEXT | | 人生で頑張ったこと |
| goals | TEXT | | 同期でやりたいこと |
| hobbies | TEXT | | ハマってる趣味 |
| reason_for_ca | TEXT | | CAに決めた理由 |
| interested_departments | TEXT[] | | 興味のある事業部 |
| tags | TEXT[] | | 自己紹介タグ |
| role | TEXT | DEFAULT 'business' | 職種（business/engineer/designer） |
| mbti | TEXT | | MBTI性格タイプ |
| sns_links | JSONB | | SNSリンク（Twitter, Instagram等） |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

### sns_links JSON構造
```json
{
  "twitter": "https://twitter.com/username",
  "instagram": "https://instagram.com/username",
  "facebook": "https://facebook.com/username",
  "github": "https://github.com/username",
  "other": "https://example.com"
}
```

---

## posts
ニュース・ブログ投稿

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

| カラム | 型 | 制約 | 説明 |
|--------|---|------|------|
| id | UUID | PRIMARY KEY | 投稿ID |
| user_id | UUID | FOREIGN KEY | 投稿者ID |
| title | TEXT | NOT NULL | タイトル |
| content | TEXT | NOT NULL | 本文 |
| thumbnail_url | TEXT | | サムネイル画像URL |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

---

## post_likes
投稿いいね

```sql
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
```

---

## post_comments
投稿コメント

```sql
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## events
イベント情報

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  capacity INTEGER,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

| カラム | 型 | 制約 | 説明 |
|--------|---|------|------|
| id | UUID | PRIMARY KEY | イベントID |
| title | TEXT | NOT NULL | タイトル |
| description | TEXT | | 説明 |
| location | TEXT | | 場所 |
| event_date | TIMESTAMP | NOT NULL | 開催日時 |
| capacity | INTEGER | | 定員 |
| created_by | UUID | FOREIGN KEY | 作成者ID |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

---

## event_participants
イベント参加者

```sql
CREATE TABLE event_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'going',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);
```

| カラム | 型 | 制約 | 説明 |
|--------|---|------|------|
| status | TEXT | DEFAULT 'going' | 参加状態（going/interested/not_going） |

---

## profile_comments
プロフィールコメント

```sql
CREATE TABLE profile_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## profile_comment_likes
プロフィールコメントいいね

```sql
CREATE TABLE profile_comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES profile_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);
```

---

## notifications
通知情報

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  related_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  related_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  related_event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

| カラム | 型 | 制約 | 説明 |
|--------|---|------|------|
| id | UUID | PRIMARY KEY | 通知ID |
| user_id | UUID | FOREIGN KEY | 通知先ユーザーID |
| type | TEXT | NOT NULL | 通知タイプ（comment/like/event_reminder） |
| title | TEXT | NOT NULL | 通知タイトル |
| message | TEXT | | 通知メッセージ |
| link | TEXT | | リンク先URL |
| related_user_id | UUID | FOREIGN KEY | 関連ユーザーID |
| related_post_id | UUID | FOREIGN KEY | 関連投稿ID |
| related_event_id | UUID | FOREIGN KEY | 関連イベントID |
| is_read | BOOLEAN | DEFAULT false | 既読フラグ |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

### 通知タイプ
- `comment` - コメント
- `like` - いいね
- `event_reminder` - イベントリマインダー

---

## インデックス

パフォーマンス向上のための推奨インデックス：

```sql
-- profiles
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- posts
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);

-- events
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_created_by ON events(created_by);

-- notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- profile_comments
CREATE INDEX idx_profile_comments_profile_id ON profile_comments(profile_id);
CREATE INDEX idx_profile_comments_user_id ON profile_comments(user_id);
```

---

## RLS (Row Level Security)

### 推奨設定

現在は全テーブルでRLSを無効化していますが、本番環境では以下のポリシーを推奨：

```sql
-- profiles: 全員が閲覧可能、本人のみ編集可能
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

---

## Supabase Storage

### avatars バケット

プロフィール写真やサムネイル画像の保存用

- **パス**: `avatars/{userId}-{timestamp}-{random}.{ext}`
- **公開設定**: Public
- **最大ファイルサイズ**: 5MB
- **許可拡張子**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`

---

## データマイグレーション

### 初期セットアップ

Supabase SQLエディタで以下を順番に実行：

1. `users` テーブル作成
2. `profiles` テーブル作成
3. `posts`, `events` テーブル作成
4. `notifications` テーブル作成
5. `profile_comments`, `profile_comment_likes` テーブル作成
6. インデックス作成

---

## バックアップ

Supabaseダッシュボードから定期的にバックアップを取得することを推奨。

---

このデータベース設計により、プロフィール共有、コミュニケーション、イベント管理の全機能を実現しています。