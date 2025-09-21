import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../src/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // データベース接続テスト
    await prisma.$connect();
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'error', database: 'disconnected' });
  } finally {
    await prisma.$disconnect();
  }
}