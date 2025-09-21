import { Project, Member, ConflictAlert, Assignment } from '../types';

export const isTimeOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const startTime1 = new Date(`2000-01-01T${start1}`);
  const endTime1 = new Date(`2000-01-01T${end1}`);
  const startTime2 = new Date(`2000-01-01T${start2}`);
  const endTime2 = new Date(`2000-01-01T${end2}`);

  return !(endTime1 <= startTime2 || startTime1 >= endTime2);
};

export const checkScheduleConflicts = (
  projects: Project[],
  members: Member[]
): ConflictAlert[] => {
  const conflicts: ConflictAlert[] = [];
  const memberAssignments: { [memberId: string]: Assignment[] } = {};

  // Build assignments map
  projects.forEach(project => {
    project.assignedMembers.forEach(memberId => {
      if (!memberAssignments[memberId]) {
        memberAssignments[memberId] = [];
      }
      memberAssignments[memberId].push({
        memberId,
        projectId: project.id,
        date: project.date,
        startTime: project.workTime.start,
        endTime: project.workTime.end,
      });
    });
  });

  // Check for conflicts
  Object.entries(memberAssignments).forEach(([memberId, assignments]) => {
    if (assignments.length < 2) return;

    const member = members.find(m => m.id === memberId);
    if (!member) return;

    // Group assignments by date
    const assignmentsByDate: { [date: string]: Assignment[] } = {};
    assignments.forEach(assignment => {
      if (!assignmentsByDate[assignment.date]) {
        assignmentsByDate[assignment.date] = [];
      }
      assignmentsByDate[assignment.date].push(assignment);
    });

    // Check for time conflicts within each date
    Object.entries(assignmentsByDate).forEach(([date, dateAssignments]) => {
      if (dateAssignments.length < 2) return;

      for (let i = 0; i < dateAssignments.length; i++) {
        for (let j = i + 1; j < dateAssignments.length; j++) {
          const assignment1 = dateAssignments[i];
          const assignment2 = dateAssignments[j];

          if (isTimeOverlap(
            assignment1.startTime,
            assignment1.endTime,
            assignment2.startTime,
            assignment2.endTime
          )) {
            const project1 = projects.find(p => p.id === assignment1.projectId);
            const project2 = projects.find(p => p.id === assignment2.projectId);

            if (project1 && project2) {
              const existingConflict = conflicts.find(
                c => c.memberId === memberId && c.date === date
              );

              if (existingConflict) {
                if (!existingConflict.conflictingProjects.includes(project1.name)) {
                  existingConflict.conflictingProjects.push(project1.name);
                }
                if (!existingConflict.conflictingProjects.includes(project2.name)) {
                  existingConflict.conflictingProjects.push(project2.name);
                }
              } else {
                conflicts.push({
                  memberId,
                  memberName: member.name,
                  conflictingProjects: [project1.name, project2.name],
                  date,
                  timeRange: `${assignment1.startTime}-${assignment1.endTime} / ${assignment2.startTime}-${assignment2.endTime}`,
                });
              }
            }
          }
        }
      }
    });
  });

  return conflicts;
};