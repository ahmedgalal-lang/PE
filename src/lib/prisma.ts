import { PrismaClient, Prisma } from '@prisma/client';

declare global {
  // Prevent multiple PrismaClients in dev
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

/**
 * Models that include orgId and should be tenant-scoped automatically.
 * Keep in sync with prisma/schema.prisma.
 */
const TENANT_MODELED = new Set([
  'Organization',
  'User',
  'Process',
  'AiSuggestion',
  'AuditLog',
  'Embedding',
]);

// Middleware to inject/require orgId scoping for protected models.
// Usage pattern: call setRequestOrg(orgId) at the start of request handlers,
// and clearRequestOrg() in a finally block.
prisma.$use(async (params: Prisma.MiddlewareParams, next) => {
  const orgId = (prisma as any).__orgId as string | undefined;
  if (!orgId) return next(params);
  if (!params.model || !TENANT_MODELED.has(params.model)) return next(params);

  if (params.action === 'create' || params.action === 'createMany') {
    if (!params.args) params.args = {};
    if (params.action === 'create') {
      params.args.data = { ...(params.args.data ?? {}), orgId };
    } else if (params.action === 'createMany') {
      if (Array.isArray(params.args.data)) {
        params.args.data = params.args.data.map((d: any) => ({ ...d, orgId }));
      } else {
        params.args.data = { ...(params.args.data ?? {}), orgId };
      }
    }
    return next(params);
  }

  const actionsToScope = new Set([
    'findMany',
    'findFirst',
    'findUnique',
    'update',
    'updateMany',
    'delete',
    'deleteMany',
    'upsert',
    'findUniqueOrThrow',
    'findFirstOrThrow',
  ]);

  if (actionsToScope.has(params.action)) {
    params.args = params.args ?? {};
    const where = params.args.where ?? {};

    if (params.action === 'findUnique' || params.action === 'findUniqueOrThrow') {
      // convert unique finds into findFirst with orgId ANDed
      params.action = params.action === 'findUnique' ? 'findFirst' : 'findFirstOrThrow';
      params.args.where = { AND: [where, { orgId }] };
      return next(params);
    }

    params.args.where = { AND: [where, { orgId }] };
    return next(params);
  }

  return next(params);
});

export function setRequestOrg(orgId: string) {
  (prisma as any).__orgId = orgId;
}

export function clearRequestOrg() {
  delete (prisma as any).__orgId;
}

/**
 * Assert that a process belongs to the org. Use in handlers that manipulate child resources.
 */
export async function assertProcessInOrg(processId: string, orgId: string) {
  const p = await prisma.process.findFirst({ where: { id: processId } });
  if (!p || p.orgId !== orgId) {
    const e: any = new Error('Process not found or access denied');
    e.status = 404;
    throw e;
  }
}

export default prisma;
