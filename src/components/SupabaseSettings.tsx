import React, { useState, useEffect } from 'react';
import { Settings, Eye, EyeOff, Check, X, Database } from 'lucide-react';

interface SupabaseSettingsProps {
  onClose: () => void;
}

const SupabaseSettings: React.FC<SupabaseSettingsProps> = ({ onClose }) => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isCreatingTables, setIsCreatingTables] = useState(false);
  const [tablesCreated, setTablesCreated] = useState(false);

  useEffect(() => {
    // 既存の設定を読み込み
    const savedUrl = localStorage.getItem('supabase_url') || '';
    const savedKey = localStorage.getItem('supabase_key') || '';
    setSupabaseUrl(savedUrl);
    setSupabaseKey(savedKey);
  }, []);

  const testConnection = async () => {
    if (!supabaseUrl || !supabaseKey) {
      setConnectionStatus('error');
      return;
    }

    setIsTestingConnection(true);
    try {
      // 簡単な接続テスト
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      if (response.ok) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const createDatabaseTables = async () => {
    if (!supabaseUrl || !supabaseKey) {
      alert('まずSupabaseの設定を保存してください');
      return;
    }

    setIsCreatingTables(true);
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // テーブル作成SQL
      const createTablesSQL = `
        -- メンバーテーブル
        CREATE TABLE IF NOT EXISTS members (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          name text NOT NULL,
          team text NOT NULL DEFAULT '',
          qualifications text[] DEFAULT '{}',
          available_hours_start text DEFAULT '09:00',
          available_hours_end text DEFAULT '18:00',
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
          date text NOT NULL,
          work_time_start text NOT NULL,
          work_time_end text NOT NULL,
          location text NOT NULL,
          work_content text DEFAULT '',
          required_members integer DEFAULT 0,
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
          member_count integer DEFAULT 0,
          representative_name text DEFAULT '',
          created_at timestamptz DEFAULT now()
        );

        -- RLS (Row Level Security) を有効化
        ALTER TABLE members ENABLE ROW LEVEL SECURITY;
        ALTER TABLE external_partners ENABLE ROW LEVEL SECURITY;
        ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
        ALTER TABLE project_member_assignments ENABLE ROW LEVEL SECURITY;
        ALTER TABLE project_external_partner_assignments ENABLE ROW LEVEL SECURITY;

        -- 全てのユーザーがアクセス可能なポリシーを作成
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'members' AND policyname = 'Allow all access') THEN
            CREATE POLICY "Allow all access" ON members FOR ALL USING (true);
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'external_partners' AND policyname = 'Allow all access') THEN
            CREATE POLICY "Allow all access" ON external_partners FOR ALL USING (true);
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Allow all access') THEN
            CREATE POLICY "Allow all access" ON projects FOR ALL USING (true);
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_member_assignments' AND policyname = 'Allow all access') THEN
            CREATE POLICY "Allow all access" ON project_member_assignments FOR ALL USING (true);
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_external_partner_assignments' AND policyname = 'Allow all access') THEN
            CREATE POLICY "Allow all access" ON project_external_partner_assignments FOR ALL USING (true);
          END IF;
        END $$;
      `;

      const { error } = await supabase.rpc('exec_sql', { sql: createTablesSQL });
      
      if (error) {
        // rpcが使えない場合は、個別にテーブルを作成
        console.log('RPC failed, trying individual table creation...');
        
        // 基本的なテーブル作成のみ実行
        const basicSQL = `
          CREATE TABLE IF NOT EXISTS members (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            name text NOT NULL,
            team text NOT NULL DEFAULT '',
            qualifications text[] DEFAULT '{}',
            available_hours_start text DEFAULT '09:00',
            available_hours_end text DEFAULT '18:00',
            available_areas text[] DEFAULT '{}',
            notes text DEFAULT '',
            is_active boolean DEFAULT true,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
          );
        `;
        
        const { error: basicError } = await supabase.from('_').select().limit(0);
        if (basicError) {
          throw new Error('データベースへの接続に失敗しました。Supabase設定を確認してください。');
        }
        
        throw new Error('テーブル作成にはSupabaseダッシュボードでのSQL実行が必要です。');
      }

      setTablesCreated(true);
      alert('データベーステーブルが正常に作成されました！');
      
      // 設定変更イベントを発火してデータを再読み込み
      window.dispatchEvent(new Event('supabaseConfigChanged'));
      
    } catch (error) {
      console.error('テーブル作成エラー:', error);
      alert(`テーブル作成に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingTables(false);
    }
  };

  const handleSave = () => {
    localStorage.setItem('supabase_url', supabaseUrl);
    localStorage.setItem('supabase_key', supabaseKey);
    localStorage.setItem('supabase_configured', 'true');
    
    // 設定変更イベントを発火
    window.dispatchEvent(new CustomEvent('supabaseConfigChanged'));
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Supabase設定を削除しますか？この操作は取り消せません。')) {
      localStorage.removeItem('supabase_url');
      localStorage.removeItem('supabase_key');
      localStorage.removeItem('supabase_configured');
      setSupabaseUrl('');
      setSupabaseKey('');
      setConnectionStatus('idle');
      
      // 設定変更イベントを発火
      window.dispatchEvent(new CustomEvent('supabaseConfigChanged'));
      onClose();
    }
  };

  const isConfigured = supabaseUrl && supabaseKey;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Supabase設定</h2>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supabase URL *
            </label>
            <input
              type="url"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supabase Anon Key *
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-800">
              <strong>設定方法:</strong>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Supabaseプロジェクトを作成</li>
                <li>Settings → API からURL・Keyを取得</li>
                <li>上記フィールドに入力して保存</li>
              </ol>
            </div>
          </div>

          {isConfigured && (
            <div className="flex gap-2">
              <button
                onClick={testConnection}
                disabled={isTestingConnection}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                {isTestingConnection ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Database className="w-4 h-4" />
                )}
                接続テスト
              </button>
              
              {connectionStatus === 'success' && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
              )}
              
              {connectionStatus === 'error' && (
                <div className="flex items-center text-red-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 rounded-b-lg">
          <div className="flex gap-3 justify-end">
            {isConfigured && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                削除
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={!isConfigured}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
          </div>
          
          {supabaseUrl && supabaseKey && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <Database className="w-4 h-4 mr-2" />
                データベースセットアップ
              </h4>
              <p className="text-sm text-blue-700 mb-3">
                初回設定時は、データベースにテーブルを作成する必要があります。
              </p>
              <button
                onClick={createDatabaseTables}
                disabled={isCreatingTables}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Database className="w-4 h-4 mr-2" />
                {isCreatingTables ? 'テーブル作成中...' : 'データベーステーブルを作成'}
              </button>
              {tablesCreated && (
                <p className="text-sm text-green-600 mt-2 flex items-center">
                  <Check className="w-4 h-4 mr-1" />
                  テーブルが作成されました
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupabaseSettings;