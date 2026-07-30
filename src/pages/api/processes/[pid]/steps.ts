import type { NextApiRequest, NextApiResponse } from 'next';
import prisma, { setRequestOrg, clearRequestOrg, assertProcessInOrg } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const orgId = (req.headers['x-org-id'] as string) ?? 'demo-org';
  setRequestOrg(orgId);
  const { pid } = req.query;

  try {
    // Ensure the parent process belongs to this org
    await assertProcessInOrg(String(pid), orgId);

    if (req.method === 'GET') {
      const steps = await prisma.step.findMany({ where: { processId: String(pid) }, orderBy: { orderIndex: 'asc' } });
      return res.json(steps);
    }

    if (req.method === 'POST') {
      const { title, description, orderIndex } = req.body;
      if (!title) return res.status(400).json({ error: 'Missing title' });
      const step = await prisma.step.create({ data: { processId: String(pid), title, description, orderIndex: orderIndex ?? 0 } });
      return res.status(201).json(step);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end();
  } catch (err: any) {
    console.error('steps handler error', err);
    return res.status(err?.status ?? 500).json({ error: String(err?.message ?? err) });
  } finally {
    clearRequestOrg();
  }
}
