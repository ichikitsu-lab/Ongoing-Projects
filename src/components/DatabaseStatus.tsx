import React from 'react';
import { Database, AlertCircle, Settings, Trash2 } from 'lucide-react';

interface DatabaseStatusProps {
  onOpenSettings: () => void;
  onDeleteSettings?: () => void;
}

const DatabaseStatus: React.FC<DatabaseStatusProps> = ({ onOpenSettings, onDeleteSettings }) => {
  const isConfigured = process.env.NODE_ENV === 'production' || !!process.env.DATABASE_URL;

  if (isConfigured) {
    return (
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
        <Database className="w-4 h-4 text-green-600" />
        <span className="text-sm text-green-700 font-medium">データベース接続済み</span>
        <div className="ml-auto flex gap-1">
          <button
            onClick={onOpenSettings}
            className="p-1 text-green-600 hover:bg-green-100 rounded"
            title="設定確認"
          >
            <Settings className="w-4 h-4" />
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
            データベースが設定されていません
          </h3>
          <p className="text-sm text-yellow-700 mb-3">
            本番環境ではPlanetScaleデータベースが必要です。現在はメモリ上でのみデータが保存されています。
          </p>
          <div className="text-xs text-yellow-600 bg-yellow-100 p-2 rounded">
            <strong>Vercel + PlanetScale設定手順:</strong>
            <ol className="list-decimal list-inside mt-1 space-y-1">
              <li>PlanetScaleでデータベースを作成</li>
              <li>Vercelの環境変数にDATABASE_URLを設定</li>
              <li>prisma db push でスキーマを同期</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseStatus;