import React, { useState } from 'react';
import { Member } from '../types';
import { Edit3, Trash2, RotateCcw, User, Award, Clock, MapPin, Search } from 'lucide-react';

interface MemberListProps {
  members: Member[];
  onEditMember: (member: Member) => void;
  onDeleteMember: (memberId: string) => void;
  onRestoreMember: (memberId: string) => void;
}

const MemberList: React.FC<MemberListProps> = ({
  members,
  onEditMember,
  onDeleteMember,
  onRestoreMember,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.team.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = showInactive ? !member.isActive : member.isActive;
    return matchesSearch && matchesStatus;
  });

  const activeCount = members.filter(m => m.isActive).length;
  const inactiveCount = members.filter(m => !m.isActive).length;

  return (
    <div className="space-y-4">
      {/* フィルター */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="メンバー名・チーム名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInactive(false)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                !showInactive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              アクティブ ({activeCount})
            </button>
            <button
              onClick={() => setShowInactive(true)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                showInactive
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              削除済み ({inactiveCount})
            </button>
          </div>
        </div>
      </div>

      {/* メンバー一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className={`bg-white border-2 rounded-lg p-4 transition-all duration-200 ${
              member.isActive
                ? 'border-gray-200 hover:border-green-300 hover:shadow-md'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  member.isActive ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <User className={`w-5 h-5 ${
                    member.isActive ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.team}</p>
                </div>
              </div>
              
              <div className="flex gap-1">
                {member.isActive ? (
                  <>
                    <button
                      onClick={() => onEditMember(member)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="編集"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteMember(member.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onRestoreMember(member.id)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                    title="復元"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              {member.qualifications.length > 0 && (
                <div className="flex items-start gap-2">
                  <Award className="w-4 h-4 mt-0.5 text-gray-400" />
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-1">
                      {member.qualifications.slice(0, 2).map((qualification, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs"
                        >
                          {qualification}
                        </span>
                      ))}
                      {member.qualifications.length > 2 && (
                        <span className="text-gray-500 text-xs">
                          +{member.qualifications.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{member.availableHours.start} - {member.availableHours.end}</span>
              </div>
              
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                <div className="flex-1">
                  <div className="flex flex-wrap gap-1">
                    {member.availableAreas.slice(0, 3).map((area, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs"
                      >
                        {area}
                      </span>
                    ))}
                    {member.availableAreas.length > 3 && (
                      <span className="text-gray-500 text-xs">
                        +{member.availableAreas.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {member.notes && (
              <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                {member.notes}
              </div>
            )}

            {!member.isActive && (
              <div className="mt-3 text-xs text-red-600 font-medium">
                削除済み
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">
            {searchTerm 
              ? '検索条件に一致するメンバーが見つかりません'
              : showInactive 
              ? '削除されたメンバーはありません'
              : 'メンバーがまだ登録されていません'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default MemberList;