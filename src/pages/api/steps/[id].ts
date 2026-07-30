import type { NextApiRequest, NextApiResponse } from 'next';
import prisma, { setRequestOrg, clearRequestOrg } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const orgId = (req.headers['x-org-id'] as string) ?? 'demo-org';
  setRequestOrg(orgId);
  const { id } = req.query;

  try {
    if (req.method === 'PUT') {
      const { title, description, risk, raci } = req.body;
      const data: any = {};
      if (title !== undefined) data.title = title;
      if (description !== undefined) data.description = description;
      // risk and raci are stored in separate models in full schema; for demo store in description/meta
      if (risk !== undefined) data.description = description ?? data.description;

      const updated = await prisma.step.update({ where: { id: String(id) }, data });
      return res.json(updated);
    }

    if (req.method === 'GET') {
      const step = await prisma.step.findUnique({ where: { id: String(id) } });
      if (!step) return res.status(404).json({ error: 'Not found' });
      return res.json(step);
    }

    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).end();
  } catch (err: any) {
    console.error('step id handler error', err);
    return res.status(err?.status ?? 500).json({ error: String(err?.message ?? err) });
  } finally {
    clearRequestOrg();
  }
}
