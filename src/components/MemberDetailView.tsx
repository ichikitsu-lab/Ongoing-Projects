import React, { useState } from 'react';
import { Member, Project } from '../types';
import { 
  User, 
  Award, 
  Clock, 
  MapPin, 
  FileText, 
  Calendar,
  Edit3,
  Trash2,
  RotateCcw
} from 'lucide-react';

interface MemberDetailViewProps {
  member: Member;
  projects: Project[];
  onEditMember: () => void;
  onDeleteMember: (memberId: string) => void;
  onRestoreMember: (memberId: string) => void;
}

const MemberDetailView: React.FC<MemberDetailViewProps> = ({
  member,
  projects,
  onEditMember,
  onDeleteMember,
  onRestoreMember,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // メンバーが参加しているプロジェクトを取得
  const memberProjects = projects
    .filter(p => p.isActive && p.assignedMembers.includes(member.id))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '明日';
    if (diffDays === -1) return '昨日';
    if (diffDays > 0) return `${diffDays}日後`;
    if (diffDays < 0) return `${Math.abs(diffDays)}日前`;
    
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const handleDeleteMember = () => {
    onDeleteMember(member.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className={`p-6 bg-white border-b shadow-sm ${!member.isActive ? 'bg-red-50 border-red-200' : ''}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg ${
              member.isActive ? 'bg-blue-500' : 'bg-red-500'
            }`}>
              {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
              <p className="text-gray-600">{member.team}</p>
              {!member.isActive && (
                <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                  削除済み
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            {member.isActive ? (
              <>
                <button
                  onClick={onEditMember}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  編集
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  削除
                </button>
              </>
            ) : (
              <button
                onClick={() => onRestoreMember(member.id)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                復元
              </button>
            )}
          </div>
        </div>

        {/* メンバー詳細情報 */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-700">保有資格</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {member.qualifications.length > 0 ? (
                    member.qualifications.map((qualification, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
                      >
                        {qualification}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">なし</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-700">稼働可能時間</div>
                <div className="text-gray-600">
                  {member.availableHours.start} - {member.availableHours.end}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-700">稼働エリア</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {member.availableAreas.map((area, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {member.notes && (
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-700">備考</div>
                  <div className="text-gray-600">{member.notes}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 参加プロジェクト一覧 */}
      <div className="flex-1 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          参加プロジェクト ({memberProjects.length})
        </h2>

        {memberProjects.length > 0 ? (
          <div className="space-y-3">
            {memberProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  <span className="text-sm text-blue-600 font-medium">
                    {formatDate(project.date)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{project.workTime.start} - {project.workTime.end}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location}</span>
                  </div>
                </div>

                {project.workContent && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                    {project.workContent}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>参加しているプロジェクトはありません</p>
          </div>
        )}
      </div>

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                メンバーを削除しますか？
              </h3>
              <p className="text-gray-600 mb-6">
                「{member.name}」を削除します。この操作は論理削除のため、後で復元できます。
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDeleteMember}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  削除する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDetailView;