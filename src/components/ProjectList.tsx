import React from 'react';
import { Project, Member } from '../types';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  selectedProject: Project | null;
  onProjectSelect: (project: Project) => void;
  members: Member[];
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  selectedProject,
  onProjectSelect,
  members,
}) => {
  const getAssignedMembersCount = (project: Project) => {
    return project.assignedMembers.length;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let dateLabel = '';
    if (diffDays === 0) dateLabel = '今日';
    else if (diffDays === 1) dateLabel = '明日';
    else if (diffDays === -1) dateLabel = '昨日';
    else if (diffDays > 0) dateLabel = `${diffDays}日後`;
    else if (diffDays < 0) dateLabel = `${Math.abs(diffDays)}日前`;
    
    const formattedDate = date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
    
    return dateLabel ? `${formattedDate} (${dateLabel})` : formattedDate;
  };

  const getProjectStatusInfo = (project: Project) => {
    const assignedCount = getAssignedMembersCount(project);
    const requiredCount = project.requiredMembers;
    const today = new Date().toISOString().split('T')[0];
    const isToday = project.date === today;
    const isPast = project.date < today;
    
    if (isPast) {
      return {
        status: 'completed',
        text: '完了',
        color: 'bg-gray-100 text-gray-700'
      };
    }
    
    if (assignedCount >= requiredCount) {
      return {
        status: 'ready',
        text: isToday ? '実行中' : '準備完了',
        color: 'bg-green-100 text-green-700'
      };
    }
    
    if (assignedCount > 0) {
      return {
        status: 'progress',
        text: '配置中',
        color: 'bg-yellow-100 text-yellow-700'
      };
    }
    
    return {
      status: 'pending',
      text: '未配置',
      color: 'bg-gray-100 text-gray-600'
    };
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        プロジェクト一覧 ({projects.length})
      </h2>
      
      <div className="space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => onProjectSelect(project)}
            className={`
              p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
              ${selectedProject?.id === project.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
              }
            `}
          >
            {/* プロジェクト保存状況インジケーター */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" title="データベースに保存済み"></div>
                <span className="text-xs text-green-600 font-medium">保存済み</span>
              </div>
            </div>
            
            <div className="mb-2">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                {project.name}
              </h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(project.date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{project.workTime.start} - {project.workTime.end}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{project.location}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs">
                <Users className="w-3 h-3 text-gray-500" />
                <span className={`
                  ${getAssignedMembersCount(project) >= project.requiredMembers
                    ? 'text-green-600 font-medium'
                    : 'text-orange-600'
                  }
                `}>
                  {getAssignedMembersCount(project)} / {project.requiredMembers}
                </span>
              </div>
              
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getProjectStatusInfo(project).color}`}>
                {getProjectStatusInfo(project).text}
              </div>
            </div>
          </div>
        ))}
        
        {projects.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">プロジェクトがありません</p>
            <p className="text-xs mt-1">新規プロジェクトを作成してください</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;