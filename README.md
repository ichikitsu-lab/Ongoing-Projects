# プロジェクト実行メンバー管理アプリ

電気設備保守業務のプロジェクトメンバー配置を管理するWebアプリケーションです。

## 機能

- **プロジェクト管理**: 作業日程、場所、必要人数の管理
- **メンバー管理**: 技術者の資格、稼働時間、エリア管理
- **協力業者管理**: 外部パートナーの管理
- **配置管理**: ドラッグ&ドロップによる直感的なメンバー配置
- **競合検知**: スケジュール重複の自動検出
- **データベース連携**: PlanetScale MySQL対応

## 技術スタック

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PlanetScale (MySQL)
- **ORM**: Prisma
- **Deployment**: Vercel

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd project-member-management
npm install
```

### 2. データベースセットアップ (PlanetScale)

1. [PlanetScale](https://planetscale.com/)でアカウント作成
2. 新しいデータベースを作成
3. 接続文字列を取得

### 3. 環境変数の設定

```bash
cp .env.example .env
```

`.env`ファイルを編集:
```env
DATABASE_URL="mysql://username:password@host:port/database"
```

### 4. データベーススキーマの同期

```bash
npm run db:generate
npm run db:push
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

## Vercelデプロイ手順

### 1. GitHubリポジトリの作成とプッシュ

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Vercelでのデプロイ

1. [Vercel](https://vercel.com/)にログイン
2. GitHubリポジトリを連携
3. 環境変数を設定:
   - `DATABASE_URL`: PlanetScaleの接続文字列

### 3. データベースの初期化

デプロイ後、Vercelのダッシュボードから以下のコマンドを実行:

```bash
npx prisma db push
```

## 使用方法

### プロジェクト作成
1. 「新規プロジェクト」ボタンをクリック
2. 作業日、時間、場所、必要人数を入力
3. 協力業者が必要な場合は追加

### メンバー配置
1. プロジェクトを選択
2. 利用可能メンバーから配置済みエリアにドラッグ&ドロップ
3. 担当メンバーを設定（王冠アイコンをクリック）
4. 「データベースに保存」ボタンで確定

### 競合管理
- 同じメンバーが同時刻に複数プロジェクトに配置された場合、自動的にアラート表示
- 赤色のインジケーターで競合を視覚的に確認

## API エンドポイント

- `GET /api/health` - データベース接続確認
- `GET /api/members` - メンバー一覧取得
- `PUT /api/members` - メンバー更新
- `GET /api/projects` - プロジェクト一覧取得
- `PUT /api/projects` - プロジェクト更新
- `GET /api/external-partners` - 協力業者一覧取得
- `PUT /api/external-partners` - 協力業者更新

## データベーススキーマ

主要テーブル:
- `members` - メンバー情報
- `projects` - プロジェクト情報
- `external_partners` - 協力業者情報
- `project_member_assignments` - メンバー配置
- `project_external_partner_assignments` - 協力業者配置

## 開発コマンド

```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run db:generate  # Prismaクライアント生成
npm run db:push      # スキーマをデータベースに同期
npm run db:migrate   # マイグレーション実行
npm run db:studio    # Prisma Studio起動
```

## ライセンス

MIT License