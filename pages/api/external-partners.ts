import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../src/lib/database';
import { ExternalPartner } from '../../src/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const partners = await prisma.externalPartner.findMany({
          orderBy: { createdAt: 'asc' }
        });
        
        const transformedPartners: ExternalPartner[] = partners.map(partner => ({
          id: partner.id,
          name: partner.name,
          isActive: partner.isActive,
          createdAt: partner.createdAt.toISOString(),
          updatedAt: partner.updatedAt.toISOString(),
        }));
        
        res.status(200).json(transformedPartners);
        break;

      case 'PUT':
        const partnerData = req.body as ExternalPartner;
        
        await prisma.externalPartner.upsert({
          where: { id: partnerData.id },
          update: {
            name: partnerData.name,
            isActive: partnerData.isActive,
            updatedAt: new Date(),
          },
          create: {
            id: partnerData.id,
            name: partnerData.name,
            isActive: partnerData.isActive,
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