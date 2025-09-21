import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../src/lib/database';
import { Project } from '../../src/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const projects = await prisma.project.findMany({
          include: {
            memberAssignments: true,
            externalPartnerAssignments: true,
          },
          orderBy: { date: 'desc' }
        });
        
        const transformedProjects: Project[] = projects.map(project => ({
          id: project.id,
          name: project.name,
          date: project.date,
          workTime: {
            start: project.workTimeStart,
            end: project.workTimeEnd,
          },
          location: project.location,
          workContent: project.workContent,
          requiredMembers: project.requiredMembers,
          notes: project.notes,
          assignedMembers: project.memberAssignments.map(a => a.memberId),
          leadMemberId: project.leadMemberId,
          externalPartners: project.externalPartnerAssignments.map(a => ({
            partnerId: a.partnerId,
            memberCount: a.memberCount,
            representativeName: a.representativeName,
          })),
          isActive: project.isActive,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
        }));
        
        res.status(200).json(transformedProjects);
        break;

      case 'PUT':
        const projectData = req.body as Project;
        
        // トランザクション内で更新
        await prisma.$transaction(async (tx) => {
          // プロジェクト基本情報を更新
          await tx.project.upsert({
            where: { id: projectData.id },
            update: {
              name: projectData.name,
              date: projectData.date,
              workTimeStart: projectData.workTime.start,
              workTimeEnd: projectData.workTime.end,
              location: projectData.location,
              workContent: projectData.workContent,
              requiredMembers: projectData.requiredMembers,
              notes: projectData.notes,
              leadMemberId: projectData.leadMemberId,
              isActive: projectData.isActive,
              updatedAt: new Date(),
            },
            create: {
              id: projectData.id,
              name: projectData.name,
              date: projectData.date,
              workTimeStart: projectData.workTime.start,
              workTimeEnd: projectData.workTime.end,
              location: projectData.location,
              workContent: projectData.workContent,
              requiredMembers: projectData.requiredMembers,
              notes: projectData.notes,
              leadMemberId: projectData.leadMemberId,
              isActive: projectData.isActive,
            },
          });

          // 既存のメンバー配置を削除
          await tx.projectMemberAssignment.deleteMany({
            where: { projectId: projectData.id }
          });

          // 新しいメンバー配置を追加
          if (projectData.assignedMembers.length > 0) {
            const uniqueMembers = [...new Set(projectData.assignedMembers)];
            await tx.projectMemberAssignment.createMany({
              data: uniqueMembers.map(memberId => ({
                projectId: projectData.id,
                memberId: memberId,
              })),
            });
          }

          // 既存の協力業者配置を削除
          await tx.projectExternalPartnerAssignment.deleteMany({
            where: { projectId: projectData.id }
          });

          // 新しい協力業者配置を追加
          if (projectData.externalPartners.length > 0) {
            await tx.projectExternalPartnerAssignment.createMany({
              data: projectData.externalPartners.map(assignment => ({
                projectId: projectData.id,
                partnerId: assignment.partnerId,
                memberCount: assignment.memberCount,
                representativeName: assignment.representativeName,
              })),
            });
          }
        });
        
        res.status(200).json({ success: true });
        break;

      default:
        res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}