import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Project, Member, ConflictAlert, ExternalPartner } from '../types';
import MemberDetailModal from './MemberDetailModal';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  Users, 
  Edit3, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  Crown,
  Plus,
  X
} from 'lucide-react';

interface MemberAvatarProps {
  member: Member;
  size?: 'sm' | 'md';
}

const MemberAvatar: React.FC<MemberAvatarProps> = ({ member, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  const initials = member.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  
  return (
    <div
      className={`${sizeClasses} bg-blue-500 text-white rounded-full flex items-center justify-center font-medium shadow-sm cursor-pointer hover:bg-blue-600 transition-colors border-2 border-white`}
      title={member.name}
    >
      {initials}
    </div>
  );
};

interface ProjectDetailProps {
  project: Project;
  members: Member[];
  externalPartners: ExternalPartner[];
  projects: Project[];
  onMemberAssignment: (projectId: string, memberIds: string[]) => void;
  onLeaderAssignment: (projectId: string, leaderId: string | undefined) => void;
  onUpdateProjects: (projects: Project[]) => void;
  onProjectDelete: (projectId: string) => void;
  onEditProject: () => void;
  conflicts: ConflictAlert[];
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  members,
  externalPartners,
  onMemberAssignment,
  onLeaderAssignment,
  onProjectDelete,
  onEditProject,
  conflicts,
}) => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReplacementModal, setShowReplacementModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [replacementData, setReplacementData] = useState<{
    newMemberId: string;
    assignedMembers: Member[];
  } | null>(null);

  const assignedMembers = members.filter(m => project.assignedMembers.includes(m.id));
  const availableMembers = members.filter(m => !project.assignedMembers.includes(m.id));
  const leadMember = project.leadMemberId ? members.find(m => m.id === project.leadMemberId) : null;
  
  const assignedPartners = project.externalPartners.map(assignment => {
    const partner = externalPartners.find(p => p.id === assignment.partnerId);
    return partner ? { ...partner, ...assignment } : null;
  }).filter(Boolean);

  const totalExternalMembers = project.externalPartners.reduce((sum, assignment) => 
    sum + assignment.memberCount, 0
  );

  const hasConflicts = conflicts.some(c => 
    c.conflictingProjects.some(cp => cp === project.name)
  );

  const handleMemberAdd = (memberId: string) => {
    console.log('👤 メンバー追加:', memberId, 'プロジェクト:', project.name);
    const newAssignedMembers = [...new Set([...project.assignedMembers, memberId])];
    console.log('📋 新しい配置リスト:', newAssignedMembers);
    setHasUnsavedChanges(true);
    onMemberAssignment(project.id, newAssignedMembers);
  };

  const handleMemberRemove = (memberId: string) => {
    console.log('👤 メンバー削除:', memberId, 'プロジェクト:', project.name);
    const newAssignedMembers = project.assignedMembers.filter(id => id !== memberId);
    console.log('📋 新しい配置リスト:', newAssignedMembers);
    setHasUnsavedChanges(true);
    onMemberAssignment(project.id, newAssignedMembers);
    
    // 担当メンバーが削除された場合、担当も解除
    if (project.leadMemberId === memberId) {
      console.log('👑 担当メンバー解除:', memberId);
      onLeaderAssignment(project.id, undefined);
    }
  };

  const handleDragEnd = (result: any) => {
    console.log('🎯 ドラッグ&ドロップ:', result);
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const memberId = draggableId;

    // 同じエリア内での移動は無視
    if (source.droppableId === destination.droppableId) return;

    if (source.droppableId === 'available' && destination.droppableId === 'assigned') {
      // 利用可能 → 配置済み（定員チェック）
      if (assignedMembers.length >= project.requiredMembers) {
        console.log('⚠️ 定員オーバー - 入れ替えモーダル表示');
        // 定員オーバーの場合、入れ替えモーダルを表示
        setReplacementData({
          newMemberId: memberId,
          assignedMembers: assignedMembers
        });
        setShowReplacementModal(true);
      } else {
        console.log('✅ 通常追加');
        handleMemberAdd(memberId);
      }
    } else if (source.droppableId === 'assigned' && destination.droppableId === 'available') {
      // 配置済み → 利用可能（直接移動）
      console.log('↩️ メンバー削除');
      handleMemberRemove(memberId);
    }
  };

  const handleLeaderAssignment = (memberId: string) => {
    // メンバーが配置されていない場合は先に配置
    if (!project.assignedMembers.includes(memberId)) {
      handleMemberAdd(memberId);
    }
    setHasUnsavedChanges(true);
    onLeaderAssignment(project.id, memberId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const handleDeleteProject = () => {
    onProjectDelete(project.id);
    setShowDeleteConfirm(false);
  };

  const handleReplacement = (replaceMemberId: string) => {
    console.log('🔄 メンバー入れ替え:', replaceMemberId, '→', replacementData?.newMemberId);
    if (!replacementData) return;

    const newAssignedMembers = project.assignedMembers
      .filter(id => id !== replaceMemberId)
      .concat(replacementData.newMemberId);
    
    console.log('📋 入れ替え後の配置リスト:', newAssignedMembers);
    setHasUnsavedChanges(true);
    onMemberAssignment(project.id, newAssignedMembers);

    if (project.leadMemberId === replaceMemberId) {
      console.log('👑 担当メンバー解除（入れ替え）:', replaceMemberId);
      onLeaderAssignment(project.id, undefined);
    }

    setShowReplacementModal(false);
    setReplacementData(null);
    
    // 入れ替え完了後、即座にデータベースに保存
    setTimeout(() => {
      handleSaveChanges();
    }, 100);
  };

  const handleSaveChanges = async () => {
    setIsUpdating(true);
    try {
      console.log('💾 データベースに変更を保存中...');
      
      // 実際にSupabaseに保存を実行
      const updatedProjects = projects.map(p =>
        p.id === project.id ? project : p
      );
      
      await onUpdateProjects(updatedProjects);
      
      setHasUnsavedChanges(false);
      console.log('✅ 変更が正常に保存されました');
    } catch (error) {
      console.error('❌ 保存エラー:', error);
      alert('保存に失敗しました: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsUpdating(false);
    }
  };
  const handleCancelReplacement = () => {
    setShowReplacementModal(false);
    setReplacementData(null);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-full flex flex-col">
        {/* ヘッダー */}
        <div className={`p-6 bg-white border-b shadow-sm ${hasConflicts ? 'bg-red-50 border-red-200' : ''}`}>
          {/* 更新ボタン */}
          {hasUnsavedChanges && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-yellow-800">
                    メンバー配置が変更されました
                  </span>
                </div>
                <button
                  onClick={handleSaveChanges}
                  disabled={isUpdating}
                  className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      保存中...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      データベースに保存
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                {hasConflicts && (
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(project.date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{project.workTime.start} - {project.workTime.end}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{project.location}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={onEditProject}
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
            </div>
          </div>

          {/* プロジェクト詳細情報 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">必要人数:</span>
                <span className="text-gray-900">{project.requiredMembers}名</span>
                <span className={`text-sm ${
                  (assignedMembers.length + totalExternalMembers) >= project.requiredMembers 
                    ? 'text-green-600' 
                    : 'text-orange-600'
                }`}>
                  (現在: {assignedMembers.length + totalExternalMembers}名)
                </span>
              </div>
              
              {project.workContent && (
                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">作業内容:</span>
                    <p className="text-gray-900 mt-1">{project.workContent}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {leadMember && (
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium text-gray-700">担当:</span>
                  <span className="text-gray-900">{leadMember.name}</span>
                </div>
              )}

              {project.notes && (
                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">備考:</span>
                    <p className="text-gray-900 mt-1">{project.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 協力業者表示 */}
          {assignedPartners.length > 0 && (
            <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="font-medium text-orange-900 mb-2">協力業者</div>
              <div className="grid grid-cols-2 gap-2">
                {assignedPartners.map((partner) => (
                  <div key={partner.partnerId} className="bg-white rounded p-2 border border-orange-200">
                    <div className="font-medium text-sm">{partner.name}</div>
                    <div className="text-xs text-gray-600">
                      {partner.memberCount}名 | 代表: {partner.representativeName || '未設定'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* メンバー配置エリア */}
        <div className="flex-1 flex">
          {/* 利用可能メンバー */}
          <div className="w-1/2 border-r border-gray-200">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-semibold text-gray-700">利用可能メンバー ({availableMembers.length}名)</h3>
            </div>
            <Droppable droppableId="available">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-4 min-h-full ${
                    snapshot.isDraggingOver ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="grid grid-cols-4 gap-3">
                    {availableMembers.map((member, index) => (
                      <Draggable key={member.id} draggableId={member.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`relative group ${
                              snapshot.isDragging ? 'rotate-3 scale-105 opacity-80' : ''
                            }`}
                          >
                            <div
                              onClick={() => setSelectedMember(member)}
                              className="cursor-pointer"
                            >
                              <MemberAvatar member={member} />
                            </div>
                            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleLeaderAssignment(member.id)}
                                className="bg-yellow-500 text-white p-1 rounded-full shadow-lg hover:bg-yellow-600"
                                title="担当に設定"
                              >
                                <Crown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* 配置済みメンバー */}
          <div className="w-1/2">
            <div className="p-4 bg-green-50 border-b">
              <h3 className="font-semibold text-gray-700">
                配置済みメンバー ({assignedMembers.length}/{project.requiredMembers}名)
              </h3>
            </div>
            <Droppable droppableId="assigned">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-4 min-h-full ${
                    snapshot.isDraggingOver ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="grid grid-cols-4 gap-3">
                    {assignedMembers.map((member, index) => (
                      <Draggable key={member.id} draggableId={member.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`relative group ${
                              snapshot.isDragging ? 'rotate-3 scale-105 opacity-80' : ''
                            }`}
                          >
                            <div
                              onClick={() => setSelectedMember(member)}
                              className="cursor-pointer relative"
                            >
                              <MemberAvatar member={member} />
                              {project.leadMemberId === member.id && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                                  <Crown className="w-2 h-2 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleLeaderAssignment(member.id)}
                                className="bg-yellow-500 text-white p-1 rounded-full shadow-lg hover:bg-yellow-600"
                                title="担当に設定"
                              >
                                <Crown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>

        {/* 入れ替えモーダル */}
        {showReplacementModal && replacementData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  メンバーを入れ替えてください
                </h3>
                <p className="text-gray-600 mb-4">
                  定員に達しています。入れ替えるメンバーを選択してください。
                </p>
                <div className="space-y-2 mb-6">
                  {replacementData.assignedMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleReplacement(member.id)}
                      className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <MemberAvatar member={member} />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-600">{member.team}</div>
                      </div>
                      {project.leadMemberId === member.id && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleCancelReplacement}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 削除確認モーダル */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  プロジェクトを削除しますか？
                </h3>
                <p className="text-gray-600 mb-6">
                  「{project.name}」を削除します。この操作は取り消せません。
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleDeleteProject}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    削除する
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* メンバー詳細モーダル */}
        {selectedMember && (
          <MemberDetailModal
            member={selectedMember}
            onClose={() => setSelectedMember(null)}
          />
        )}
      </div>
    </DragDropContext>
  );
};

export default ProjectDetail;