import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../src/lib/database';
import { Member } from '../../src/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const members = await prisma.member.findMany({
          orderBy: { createdAt: 'asc' }
        });
        
        const transformedMembers: Member[] = members.map(member => ({
          id: member.id,
          name: member.name,
          team: member.team,
          qualifications: Array.isArray(member.qualifications) ? member.qualifications as string[] : [],
          availableHours: {
            start: member.availableHoursStart,
            end: member.availableHoursEnd,
          },
          availableAreas: Array.isArray(member.availableAreas) ? member.availableAreas as string[] : [],
          notes: member.notes,
          isActive: member.isActive,
          createdAt: member.createdAt.toISOString(),
          updatedAt: member.updatedAt.toISOString(),
        }));
        
        res.status(200).json(transformedMembers);
        break;

      case 'PUT':
        const memberData = req.body as Member;
        
        await prisma.member.upsert({
          where: { id: memberData.id },
          update: {
            name: memberData.name,
            team: memberData.team,
            qualifications: memberData.qualifications,
            availableHoursStart: memberData.availableHours.start,
            availableHoursEnd: memberData.availableHours.end,
            availableAreas: memberData.availableAreas,
            notes: memberData.notes,
            isActive: memberData.isActive,
            updatedAt: new Date(),
          },
          create: {
            id: memberData.id,
            name: memberData.name,
            team: memberData.team,
            qualifications: memberData.qualifications,
            availableHoursStart: memberData.availableHours.start,
            availableHoursEnd: memberData.availableHours.end,
            availableAreas: memberData.availableAreas,
            notes: memberData.notes,
            isActive: memberData.isActive,
          },
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