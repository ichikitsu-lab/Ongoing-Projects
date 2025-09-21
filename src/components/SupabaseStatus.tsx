import React from 'react';
import { Database, AlertCircle, Settings, Trash2 } from 'lucide-react';

interface SupabaseStatusProps {
  onOpenSettings: () => void;
  onDeleteSettings?: () => void;
}

const SupabaseStatus: React.FC<SupabaseStatusProps> = ({ onOpenSettings, onDeleteSettings }) => {
  const isConfigured = localStorage.getItem('supabase_configured') === 'true';

  const handleDelete = () => {
    if (confirm('Supabase設定を削除しますか？この操作は取り消せません。')) {
      localStorage.removeItem('supabase_url');
      localStorage.removeItem('supabase_key');
      localStorage.removeItem('supabase_configured');
      
      // 設定変更イベントを発火
      window.dispatchEvent(new CustomEvent('supabaseConfigChanged'));
      
      if (onDeleteSettings) {
        onDeleteSettings();
      }
    }
  };

  if (isConfigured) {
    return (
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
        <Database className="w-4 h-4 text-green-600" />
        <span className="text-sm text-green-700 font-medium">Supabase接続済み</span>
        <div className="ml-auto flex gap-1">
          <button
            onClick={onOpenSettings}
            className="p-1 text-green-600 hover:bg-green-100 rounded"
            title="設定変更"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
            title="設定削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-yellow-800 mb-1">
            Supabaseが設定されていません
          </h3>
          <p className="text-sm text-yellow-700 mb-3">
            データの永続化にはSupabaseの設定が必要です。現在はメモリ上でのみデータが保存されています。
          </p>
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 bg-yellow-600 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-700 text-sm"
          >
            <Settings className="w-4 h-4" />
            Supabaseを設定
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupabaseStatus;