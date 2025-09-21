import React from 'react';
import { ConflictAlert } from '../types';
import { AlertTriangle, X } from 'lucide-react';

interface ConflictAlertsProps {
  conflicts: ConflictAlert[];
}

const ConflictAlerts: React.FC<ConflictAlertsProps> = ({ conflicts }) => {
  if (conflicts.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      {conflicts.map((conflict, index) => (
        <div
          key={index}
          className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-red-900 text-sm">
              スケジュール重複警告
            </div>
            <div className="text-red-700 text-sm">
              <strong>{conflict.memberName}</strong> が {conflict.date} の {conflict.timeRange} に
              複数のプロジェクトに配置されています
            </div>
            <div className="text-red-600 text-xs mt-1">
              重複プロジェクト: {conflict.conflictingProjects.join(', ')}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConflictAlerts;