import React, { useState } from 'react';
import { Member, MemberFormData } from '../types';
import MemberForm from './MemberForm';
import MemberList from './MemberList';
import { Plus, Users } from 'lucide-react';

interface MemberManagementProps {
  members: Member[];
  onUpdateMembers: (members: Member[]) => void;
}

const MemberManagement: React.FC<MemberManagementProps> = ({
  members,
  onUpdateMembers,
}) => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showForm, setShowForm] = useState(false);

  const activeMembers = members.filter(m => m.isActive);

  const handleCreateMember = () => {
    setSelectedMember(null);
    setShowForm(true);
  };

  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setShowForm(true);
  };

  const handleSaveMember = (memberData: MemberFormData) => {
    const now = new Date().toISOString();
    
    if (selectedMember) {
      // 更新
      const updatedMembers = members.map(m =>
        m.id === selectedMember.id
          ? {
              ...m,
              name: memberData.name,
              team: memberData.team,
              qualifications: memberData.qualifications,
              availableHours: {
                start: memberData.availableHoursStart,
                end: memberData.availableHoursEnd,
              },
              availableAreas: memberData.availableAreas,
              notes: memberData.notes,
              updatedAt: now,
            }
          : m
      );
      onUpdateMembers(updatedMembers);
    } else {
      // 新規作成
      const newMember: Member = {
        id: `member-${Date.now()}`,
        name: memberData.name,
        team: memberData.team,
        qualifications: memberData.qualifications,
        availableHours: {
          start: memberData.availableHoursStart,
          end: memberData.availableHoursEnd,
        },
        availableAreas: memberData.availableAreas,
        notes: memberData.notes,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      onUpdateMembers([...members, newMember]);
    }
    
    setShowForm(false);
    setSelectedMember(null);
  };

  const handleDeleteMember = (memberId: string) => {
    const updatedMembers = members.map(m =>
      m.id === memberId
        ? { ...m, isActive: false, updatedAt: new Date().toISOString() }
        : m
    );
    onUpdateMembers(updatedMembers);
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
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6" />
              <h1 className="text-2xl font-bold">メンバー管理</h1>
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                {activeMembers.length}名
              </span>
            </div>
            <button
              onClick={handleCreateMember}
              className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              新規メンバー追加
            </button>
          </div>
        </div>

        {showForm ? (
          <div className="p-6">
            <MemberForm
              member={selectedMember}
              onSave={handleSaveMember}
              onCancel={() => {
                setShowForm(false);
                setSelectedMember(null);
              }}
            />
          </div>
        ) : (
          <div className="p-6">
            <MemberList
              members={members}
              onEditMember={handleEditMember}
              onDeleteMember={handleDeleteMember}
              onRestoreMember={handleRestoreMember}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberManagement;