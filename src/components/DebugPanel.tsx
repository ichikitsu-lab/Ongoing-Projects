import React, { useState } from 'react';
import { Project, Member } from '../types';
import { Bug, ChevronDown, ChevronUp, Database, Users, Calendar } from 'lucide-react';

interface DebugPanelProps {
  projects: Project[];
  members: Member[];
  isDatabaseConnected: boolean;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  projects,
  members,
  isDatabaseConnected,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');

  const activeProjects = projects.filter(p => p.isActive);
  const activeMembers = members.filter(m => m.isActive);
  
  const selectedProjectData = selectedProject 
    ? activeProjects.find(p => p.id === selectedProject)
    : null;

  const clearLogs = () => {
    console.clear();
    console.log('🧹 ログをクリアしました');
  };

  const testCRUDOperations = () => {
    console.log('🧪 CRUD操作テスト開始');
    console.log('📊 現在のプロジェクト数:', activeProjects.length);
    console.log('👥 現在のメンバー数:', activeMembers.length);
    console.log('🔗 データベース接続状態:', isDatabaseConnected);
    
    if (selectedProjectData) {
      console.log('📋 選択されたプロジェクト:', {
        id: selectedProjectData.id,
        name: selectedProjectData.name,
        assignedMembers: selectedProjectData.assignedMembers,
        requiredMembers: selectedProjectData.requiredMembers,
        leadMemberId: selectedProjectData.leadMemberId,
      });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white border border-gray-300 rounded-lg shadow-lg transition-all duration-300 ${
        isExpanded ? 'w-96 h-80' : 'w-auto h-auto'
      }`}>
        <div 
          className="flex items-center gap-2 p-3 bg-gray-100 rounded-t-lg cursor-pointer hover:bg-gray-200"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Bug className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-gray-700">デバッグパネル</span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-500 ml-auto" />
          )}
        </div>

        {isExpanded && (
          <div className="p-4 space-y-4 max-h-64 overflow-y-auto">
            {/* 接続状態 */}
            <div className="flex items-center gap-2 text-sm">
              <Database className="w-4 h-4" />
              <span className={`font-medium ${
                isDatabaseConnected ? 'text-green-600' : 'text-red-600'
              }`}>
                {isDatabaseConnected ? 'データベース接続中' : 'モックデータ使用中'}
              </span>
            </div>

            {/* 統計情報 */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-blue-50 p-2 rounded">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-blue-600" />
                  <span className="font-medium">プロジェクト</span>
                </div>
                <div className="text-blue-900">{activeProjects.length}件</div>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-green-600" />
                  <span className="font-medium">メンバー</span>
                </div>
                <div className="text-green-900">{activeMembers.length}名</div>
              </div>
            </div>

            {/* プロジェクト選択 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                テスト対象プロジェクト
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="">プロジェクトを選択...</option>
                {activeProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.assignedMembers.length}/{project.requiredMembers}名)
                  </option>
                ))}
              </select>
            </div>

            {/* 選択されたプロジェクトの詳細 */}
            {selectedProjectData && (
              <div className="bg-gray-50 p-2 rounded text-xs">
                <div className="font-medium mb-1">配置状況:</div>
                <div>配置済み: {selectedProjectData.assignedMembers.length}名</div>
                <div>必要人数: {selectedProjectData.requiredMembers}名</div>
                <div>担当: {selectedProjectData.leadMemberId ? 
                  activeMembers.find(m => m.id === selectedProjectData.leadMemberId)?.name || '不明' 
                  : '未設定'
                }</div>
              </div>
            )}

            {/* アクションボタン */}
            <div className="space-y-2">
              <button
                onClick={testCRUDOperations}
                className="w-full bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700"
              >
                CRUD操作テスト実行
              </button>
              <button
                onClick={clearLogs}
                className="w-full bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700"
              >
                コンソールログクリア
              </button>
            </div>

            <div className="text-xs text-gray-500 border-t pt-2">
              💡 ブラウザの開発者ツール（F12）でコンソールを確認してください
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugPanel;