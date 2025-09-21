/*
  # 初期データベーススキーマの作成

  1. 新しいテーブル
    - `members` - メンバー情報
      - `id` (uuid, primary key)
      - `name` (text) - 氏名
      - `team` (text) - 所属チーム
      - `qualifications` (text[]) - 保有資格
      - `available_hours_start` (time) - 稼働開始時間
      - `available_hours_end` (time) - 稼働終了時間
      - `available_areas` (text[]) - 稼働エリア
      - `notes` (text) - 備考
      - `is_active` (boolean) - アクティブフラグ
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `external_partners` - 協力業者情報
      - `id` (uuid, primary key)
      - `name` (text) - 業者名
      - `is_active` (boolean) - アクティブフラグ
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `projects` - プロジェクト情報
      - `id` (uuid, primary key)
      - `name` (text) - プロジェクト名
      - `date` (date) - 実施日
      - `work_time_start` (time) - 開始時間
      - `work_time_end` (time) - 終了時間
      - `location` (text) - 作業場所
      - `work_content` (text) - 作業内容
      - `required_members` (integer) - 必要人数
      - `notes` (text) - 備考
      - `lead_member_id` (uuid) - 担当メンバーID
      - `is_active` (boolean) - アクティブフラグ
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `project_member_assignments` - プロジェクトメンバー配置
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key)
      - `member_id` (uuid, foreign key)
      - `created_at` (timestamptz)

    - `project_external_partner_assignments` - プロジェクト協力業者配置
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key)
      - `partner_id` (uuid, foreign key)
      - `member_count` (integer) - 人数
      - `representative_name` (text) - 代表者名
      - `created_at` (timestamptz)

  2. セキュリティ
    - 全テーブルでRLSを有効化
    - 認証済みユーザーのみアクセス可能なポリシーを設定
*/

-- メンバーテーブル
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  team text NOT NULL,
  qualifications text[] DEFAULT '{}',
  available_hours_start time NOT NULL DEFAULT '08:00',
  available_hours_end time NOT NULL DEFAULT '18:00',
  available_areas text[] DEFAULT '{}',
  notes text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 協力業者テーブル
CREATE TABLE IF NOT EXISTS external_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- プロジェクトテーブル
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  date date NOT NULL,
  work_time_start time NOT NULL,
  work_time_end time NOT NULL,
  location text NOT NULL,
  work_content text DEFAULT '',
  required_members integer NOT NULL DEFAULT 1,
  notes text DEFAULT '',
  lead_member_id uuid REFERENCES members(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- プロジェクトメンバー配置テーブル
CREATE TABLE IF NOT EXISTS project_member_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, member_id)
);

-- プロジェクト協力業者配置テーブル
CREATE TABLE IF NOT EXISTS project_external_partner_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL REFERENCES external_partners(id) ON DELETE CASCADE,
  member_count integer NOT NULL DEFAULT 1,
  representative_name text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, partner_id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_members_active ON members(is_active);
CREATE INDEX IF NOT EXISTS idx_projects_date ON projects(date);
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(is_active);
CREATE INDEX IF NOT EXISTS idx_project_assignments_project ON project_member_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_member ON project_member_assignments(member_id);

-- RLS有効化
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_member_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_external_partner_assignments ENABLE ROW LEVEL SECURITY;

-- ポリシー作成（全ユーザーがアクセス可能 - 認証不要）
CREATE POLICY "Allow all access to members" ON members FOR ALL USING (true);
CREATE POLICY "Allow all access to external_partners" ON external_partners FOR ALL USING (true);
CREATE POLICY "Allow all access to projects" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all access to project_member_assignments" ON project_member_assignments FOR ALL USING (true);
CREATE POLICY "Allow all access to project_external_partner_assignments" ON project_external_partner_assignments FOR ALL USING (true);