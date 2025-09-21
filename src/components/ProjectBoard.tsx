import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Member, Project, ConflictAlert, ExternalPartner } from '../types';
import ProjectColumn from './ProjectColumn';
import MemberCard from './MemberCard';
import FilterPanel from './FilterPanel';
import ConflictAlerts from './ConflictAlerts';
import MemberDetailModal from './MemberDetailModal';
import { checkScheduleConflicts } from '../utils/conflictChecker';

interface ProjectBoardProps {
  projects: Project[];
  members: Member[];
  externalPartners: ExternalPartner[];
  onUpdateProjects: (projects: Project[]) => void;
  onUpdateMembers: (members: Member[]) => void;
}

const ProjectBoard: React.FC<ProjectBoardProps> = ({
  projects,
  members,
  externalPartners,
  onUpdateProjects,
  onUpdateMembers,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [conflicts, setConflicts] = useState<ConflictAlert[]>([]);

  const filteredProjects = projects.filter(project => project.date === selectedDate);
  
  const unassignedMembers = members.filter(member => {
    const isAssignedToAnyProject = filteredProjects.some(project => 
      project.assignedMembers.includes(member.id)
    );
    return !isAssignedToAnyProject && 
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const memberId = draggableId;
    
    // Update projects
    const updatedProjects = projects.map(project => {
      // Remove member from source project
      if (source.droppableId !== 'unassigned' && source.droppableId === project.id) {
        return {
          ...project,
          assignedMembers: project.assignedMembers.filter(id => id !== memberId)
        };
      }
      
      // Add member to destination project
      if (destination.droppableId !== 'unassigned' && destination.droppableId === project.id) {
        const newAssignedMembers = [...new Set([...project.assignedMembers, memberId])];
        return {
          ...project,
          assignedMembers: newAssignedMembers
        };
      }
      
      return project;
    });

    // Check for conflicts
    const newConflicts = checkScheduleConflicts(updatedProjects, members);
    setConflicts(newConflicts);

    onUpdateProjects(updatedProjects);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      <div className="p-6 bg-white shadow-sm border-b">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">プロジェクト実行メンバー管理</h1>
        <FilterPanel
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        {conflicts.length > 0 && <ConflictAlerts conflicts={conflicts} />}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex h-full overflow-x-auto">
          {/* Unassigned Members Panel */}
          <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-700">未配置メンバー</h2>
              <span className="text-sm text-gray-500">{unassignedMembers.length}名</span>
            </div>
            <Droppable droppableId="unassigned">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-4 min-h-full ${
                    snapshot.isDraggingOver ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="space-y-3">
                    {unassignedMembers.map((member, index) => (
                      <Draggable key={member.id} draggableId={member.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => setSelectedMember(member)}
                          >
                            <MemberCard
                              member={member}
                              isDragging={snapshot.isDragging}
                              hasConflict={conflicts.some(c => c.memberId === member.id)}
                            />
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

          {/* Project Columns */}
          <div className="flex-1 flex overflow-x-auto">
            {filteredProjects.map(project => (
              <ProjectColumn
                key={project.id}
                project={project}
                members={members.filter(m => project.assignedMembers.includes(m.id))}
                externalPartners={externalPartners}
                onMemberClick={setSelectedMember}
                conflicts={conflicts}
              />
            ))}
            {filteredProjects.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="text-lg">選択した日付にプロジェクトはありません</p>
                  <p className="text-sm">他の日付を選択してください</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DragDropContext>

      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
};