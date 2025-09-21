import React, { useState } from 'react';
import { Member, Project, ConflictAlert, ExternalPartner } from '../types';
import Dashboard from './Dashboard';
import MemberListSidebar from './MemberListSidebar';
import ProjectDetail from './ProjectDetail';
import ProjectForm from './ProjectForm';
import MemberManagement from './MemberManagement';
import MemberDetailView from './MemberDetailView';
import ExternalPartnerManagement from './ExternalPartnerManagement';
import ConflictAlerts from './ConflictAlerts';
import SupabaseSettings from './SupabaseSettings';
import SupabaseStatus from './SupabaseStatus';
import DebugPanel from './DebugPanel';
import { Plus, Users, FolderOpen, Home, Building2 } from 'lucide-react';
import { checkScheduleConflicts } from '../utils/conflictChecker';

interface ProjectManagementProps {
  projects: Project[];
  members: Member[];
  externalPartners: ExternalPartner[];
  onUpdateProjects: (projects: Project[]) => void;
  onUpdateMembers: (members: Member[]) => void;
  onUpdateExternalPartners: (partners: ExternalPartner[]) => void;
  isDatabaseConnected: boolean;
}

const ProjectManagement: React.FC<ProjectManagementProps> = ({
  projects,
  members,
  externalPartners,
  onUpdateProjects,
  onUpdateMembers,
  onUpdateExternalPartners,
  isDatabaseConnected,
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showMemberManagement, setShowMemberManagement] = useState(false);
  const [showPartnerManagement, setShowPartnerManagement] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  const [conflicts, setConflicts] = useState<ConflictAlert[]>([]);
  const [showSupabaseSettings, setShowSupabaseSettings] = useState(false);
  const [showDatabaseSettings, setShowDatabaseSettings] = useState(false);

  const handleDeleteSupabaseSettings = () => {
    // 設定削除後の処理
  };

  const activeProjects = projects.filter(p => p.isActive);
  const activeMembers = members.filter(m => m.isActive);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setShowProjectForm(false);
    setShowMemberManagement(false);
    setShowPartnerManagement(false);
    setShowDashboard(false);
  };

  const handleCreateProject = () => {
    setSelectedProject(null);
    setSelectedMember(null);
    setShowProjectForm(true);
    setShowMemberManagement(false);
    setShowPartnerManagement(false);
    setShowDashboard(false);
  };

  const handleShowMemberManagement = () => {
    setSelectedProject(null);
    setSelectedMember(null);
    setShowProjectForm(false);
    setShowMemberManagement(true);
    setShowPartnerManagement(false);
    setShowDashboard(false);
  };

  const handleShowPartnerManagement = () => {
    setSelectedProject(null);
    setSelectedMember(null);
    setShowProjectForm(false);
    setShowMemberManagement(false);
    setShowPartnerManagement(true);
    setShowDashboard(false);
  };

  const handleShowDashboard = () => {
    setSelectedProject(null);
    setSelectedMember(null);
    setShowProjectForm(false);
    setShowMemberManagement(false);
    setShowPartnerManagement(false);
    setShowDashboard(true);
  };

  const handleProjectSave = (projectData: any) => {
    const now = new Date().toISOString();
    
    if (selectedProject) {
      // 更新
      const updatedProjects = projects.map(p =>
        p.id === selectedProject.id
          ? { ...p, ...projectData, updatedAt: now }
          : p
      );
      onUpdateProjects(updatedProjects);
    } else {
      // 新規作成
      const newProject: Project = {
        id: `project-${Date.now()}`,
        ...projectData,
        assignedMembers: [],
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      onUpdateProjects([...projects, newProject]);
    }
    
    setShowProjectForm(false);
    setShowDashboard(true);
    
    // 競合チェック
    const newConflicts = checkScheduleConflicts(projects, activeMembers);
    setConflicts(newConflicts);
  };

  const handleProjectDelete = (projectId: string) => {
    const updatedProjects = projects.map(p =>
      p.id === projectId
        ? { ...p, isActive: false, updatedAt: new Date().toISOString() }
        : p
    );
    onUpdateProjects(updatedProjects);
    setSelectedProject(null);
  };

  const handleMemberAssignment = (projectId: string, memberIds: string[]) => {
    console.log('🎯 メンバー配置変更:', projectId, memberIds);
    const updatedProjects = projects.map(p =>
      p.id === projectId
        ? { ...p, assignedMembers: memberIds, updatedAt: new Date().toISOString() }
        : p
    );
    console.log('📊 更新されたプロジェクト:', updatedProjects.find(p => p.id === projectId));
    onUpdateProjects(updatedProjects);
    
    // 競合チェック
    const newConflicts = checkScheduleConflicts(updatedProjects, activeMembers);
    setConflicts(newConflicts);
  };

  const handleLeaderAssignment = (projectId: string, leaderId: string | undefined) => {
    const updatedProjects = projects.map(p =>
      p.id === projectId
        ? { ...p, leadMemberId: leaderId, updatedAt: new Date().toISOString() }
        : p
    );
    onUpdateProjects(updatedProjects);
  };

  const handleExternalPartnersUpdate = (projectId: string, partnerIds: string[]) => {
    const updatedProjects = projects.map(p =>
      p.id === projectId
        ? { ...p, externalPartners: partnerIds, updatedAt: new Date().toISOString() }
        : p
    );
    onUpdateProjects(updatedProjects);
  };

  const handleMemberSelect = (member: Member) => {
    setSelectedMember(member);
    setSelectedProject(null);
    setShowProjectForm(false);
    setShowMemberManagement(false);
    setShowPartnerManagement(false);
    setShowDashboard(false);
  };

  const handleEditSelectedMember = () => {
    setShowMemberManagement(true);
    // MemberManagementコンポーネントで選択されたメンバーを編集状態にする処理は
    // MemberManagementコンポーネント内で実装する必要があります
  };

  const handleDeleteMember = (memberId: string) => {
    const updatedMembers = members.map(m =>
      m.id === memberId
        ? { ...m, isActive: false, updatedAt: new Date().toISOString() }
        : m
    );
    onUpdateMembers(updatedMembers);
    setSelectedMember(null);
    setShowDashboard(true);
  };

  const handleRestoreMember = (memberId: string) => {
    const updatedMembers = members.map(m =>
      m.id === memberId
        ? { ...m, isActive: true, updatedAt: new Date().toISOString() }
        : m
    );
    onUpdateMembers(updatedMembers);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* サイドバー */}
      <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <h1 className="text-2xl font-bold mb-4">プロジェクト管理</h1>
          <div className="space-y-2">
            <button
              onClick={handleShowDashboard}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                showDashboard 
                  ? 'bg-white bg-opacity-30 text-white' 
                  : 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              ダッシュボード
            </button>
            <button
              onClick={handleCreateProject}
              className="w-full flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all duration-200 text-white"
            >
              <Plus className="w-4 h-4" />
              新規プロジェクト
            </button>
            <button
              onClick={handleShowMemberManagement}
              className="w-full flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all duration-200 text-white"
            >
              <Users className="w-4 h-4" />
              メンバー管理
            </button>
            <button
              onClick={handleShowPartnerManagement}
              className="w-full flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all duration-200 text-white"
            >
              <Building2 className="w-4 h-4" />
              協力業者管理
            </button>
          </div>
        </div>

        {/* 競合アラート */}
        {conflicts.length > 0 && (
          <div className="p-4 border-b">
            <ConflictAlerts conflicts={conflicts} />
          </div>
        )}

        {/* Supabase設定状況 */}
        <div className="p-4 border-b">
          <SupabaseStatus 
            onOpenSettings={() => setShowSupabaseSettings(true)}
            onDeleteSettings={handleDeleteSupabaseSettings}
          />
          {isDatabaseConnected && (
            <div className="mt-2 text-xs text-green-600">
              データベース連携中
            </div>
          )}
        </div>

        {/* プロジェクト一覧 */}
        <div className="flex-1 overflow-y-auto">
          <MemberListSidebar
            members={activeMembers}
            projects={activeProjects}
            onMemberClick={handleMemberSelect}
            selectedMember={selectedMember}
          />
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col">
        {showDashboard ? (
          <Dashboard
            projects={activeProjects}
            members={activeMembers}
            externalPartners={externalPartners}
            onProjectSelect={handleProjectSelect}
            onCreateProject={handleCreateProject}
          />
        ) : showProjectForm ? (
          <div className="flex-1 p-6">
            <ProjectForm
              project={selectedProject}
              externalPartners={externalPartners}
              onSave={handleProjectSave}
              onCancel={() => setShowProjectForm(false)}
            />
          </div>
        ) : showMemberManagement ? (
          <div className="flex-1 p-6">
            <MemberManagement
              members={members}
              onUpdateMembers={onUpdateMembers}
            />
          </div>
        ) : showPartnerManagement ? (
          <div className="flex-1 p-6">
            <ExternalPartnerManagement
              partners={externalPartners}
              onUpdatePartners={onUpdateExternalPartners}
            />
          </div>
        ) : selectedMember ? (
          <div className="flex-1">
            <MemberDetailView
              member={selectedMember}
              projects={activeProjects}
              onEditMember={handleEditSelectedMember}
              onDeleteMember={handleDeleteMember}
              onRestoreMember={handleRestoreMember}
            />
          </div>
        ) : selectedProject ? (
          <div className="flex-1">
            <ProjectDetail
              project={selectedProject}
              members={activeMembers}
              externalPartners={externalPartners}
              projects={projects}
              onMemberAssignment={handleMemberAssignment}
              onLeaderAssignment={handleLeaderAssignment}
              onUpdateProjects={onUpdateProjects}
              onProjectDelete={handleProjectDelete}
              onEditProject={() => setShowProjectForm(true)}
              conflicts={conflicts}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-semibold mb-2">プロジェクトを選択してください</h2>
              <p className="text-gray-400">
                左側のリストからプロジェクトを選択するか、<br />
                新規プロジェクトを作成してください
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Supabase設定モーダル */}
      {showSupabaseSettings && (
        <SupabaseSettings onClose={() => setShowSupabaseSettings(false)} />
      )}

      {/* デバッグパネル */}
      <DebugPanel
        projects={projects}
        members={members}
        isDatabaseConnected={isDatabaseConnected}
      />
    </div>
  );
};

export default ProjectManagement;