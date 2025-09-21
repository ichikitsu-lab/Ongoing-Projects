import React, { useState } from 'react';
import { Member, Project } from '../types';
import { User, Calendar, MapPin, Clock, Search, Award, Users } from 'lucide-react';

interface MemberListSidebarProps {
  members: Member[];
  projects: Project[];
  onMemberClick: (member: Member) => void;
  selectedMember?: Member | null;
}

const MemberListSidebar: React.FC<MemberListSidebarProps> = ({
  members,
  projects,
  onMemberClick,
  selectedMember,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const activeMembers = members.filter(m => m.isActive);
  
  const filteredMembers = activeMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMemberRecentProject = (member: Member) => {
    // メンバーが参加している最新のプロジェクトを取得
    const memberProjects = projects
      .filter(p => p.isActive && p.assignedMembers.includes(member.id))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return memberProjects[0] || null;
  };

  const formatProjectDate = (dateString: string) => {
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
      month: 'short',
      day: 'numeric'
    });
  };

  const MemberAvatar: React.FC<{ member: Member }> = ({ member }) => {
    const initials = member.name.split(' ').map(n => n[0]).join('').slice(0, 2);
    
    return (
      <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-medium text-sm shadow-sm">
        {initials}
      </div>
    );
  };

  return (
    <div className="p-4">
      {/* 検索バー */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="メンバー検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* ヘッダー */}
      <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5" />
        メンバー一覧 ({filteredMembers.length})
      </h2>
      
      {/* メンバー一覧 */}
      <div className="space-y-3">
        {filteredMembers.map((member) => {
          const recentProject = getMemberRecentProject(member);
          const isSelected = selectedMember?.id === member.id;
          
          return (
            <div
              key={member.id}
              onClick={() => onMemberClick(member)}
              className={`
                p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                }
              `}
            >
              {/* メンバー基本情報 */}
              <div className="flex items-center gap-3 mb-2">
                <MemberAvatar member={member} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {member.name}
                  </h3>
                  <p className="text-xs text-gray-600 truncate">{member.team}</p>
                </div>
                
                {/* オンライン状況インジケーター */}
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" title="アクティブ"></div>
                </div>
              </div>

              {/* 資格情報 */}
              {member.qualifications.length > 0 && (
                <div className="flex items-center gap-1 mb-2">
                  <Award className="w-3 h-3 text-gray-400" />
                  <div className="flex flex-wrap gap-1">
                    {member.qualifications.slice(0, 2).map((qualification, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs"
                      >
                        {qualification.length > 8 ? qualification.substring(0, 8) + '...' : qualification}
                      </span>
                    ))}
                    {member.qualifications.length > 2 && (
                      <span className="text-gray-500 text-xs">+{member.qualifications.length - 2}</span>
                    )}
                  </div>
                </div>
              )}

              {/* 稼働時間 */}
              <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                <Clock className="w-3 h-3" />
                <span>{member.availableHours.start} - {member.availableHours.end}</span>
              </div>

              {/* 直近参加プロジェクト */}
              {recentProject ? (
                <div className="mt-2 p-2 bg-gray-50 rounded border-l-2 border-blue-400">
                  <div className="flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3 text-blue-600" />
                    <span className="text-xs font-medium text-blue-900">直近プロジェクト</span>
                  </div>
                  <div className="text-xs text-gray-700">
                    <div className="font-medium truncate">{recentProject.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-blue-600 font-medium">
                        {formatProjectDate(recentProject.date)}
                      </span>
                      <span className="text-gray-500">
                        {recentProject.workTime.start}-{recentProject.workTime.end}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-600 truncate">{recentProject.location}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-2 p-2 bg-gray-50 rounded text-center">
                  <span className="text-xs text-gray-500">未配置</span>
                </div>
              )}

              {/* 備考（ある場合のみ） */}
              {member.notes && (
                <div className="mt-2 text-xs text-gray-500 bg-yellow-50 rounded p-1 border-l-2 border-yellow-400">
                  {member.notes.length > 30 ? member.notes.substring(0, 30) + '...' : member.notes}
                </div>
              )}
            </div>
          );
        })}
        
        {filteredMembers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">
              {searchTerm 
                ? '検索条件に一致するメンバーが見つかりません'
                : 'メンバーがまだ登録されていません'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberListSidebar;