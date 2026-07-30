import type { NextApiRequest, NextApiResponse } from 'next';
import prisma, { setRequestOrg, clearRequestOrg } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Demo: header-based tenant scoping. Replace with session extraction in production.
  const orgId = (req.headers['x-org-id'] as string) ?? 'demo-org';
  setRequestOrg(orgId);

  try {
    if (req.method === 'GET') {
      const procs = await prisma.process.findMany({ select: { id: true, title: true, description: true }, take: 50 });
      return res.json(procs);
    }

    if (req.method === 'POST') {
      const { title, description } = req.body;
      if (!title) return res.status(400).json({ error: 'Missing title' });
      const p = await prisma.process.create({ data: { title, description } });
      return res.status(201).json(p);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end();
  } catch (err: any) {
    console.error('processes handler error:', err);
    return res.status(err?.status ?? 500).json({ error: String(err?.message ?? err) });
  } finally {
    clearRequestOrg();
  }
}
