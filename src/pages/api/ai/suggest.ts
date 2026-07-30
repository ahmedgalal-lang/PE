import type { NextApiRequest, NextApiResponse } from "next";
import prisma, { setRequestOrg, clearRequestOrg } from "../../lib/prisma";
import { buildSuggestionPrompt, generateSuggestionAndStore } from "../../lib/ai";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const orgId = (req.headers["x-org-id"] as string) ?? undefined;
  if (!orgId) return res.status(400).json({ error: "Missing X-Org-Id header" });

  setRequestOrg(orgId);

  const { processId, stepId, stepTitle, stepDescription, contextSnippets } = req.body;
  if (!processId) return res.status(400).json({ error: "Missing processId" });

  try {
    // lightweight process fetch for prompt
    const proc = await prisma.process.findFirst({ where: { id: processId }, select: { id: true, title: true, description: true, orgId: true } });
    if (!proc || proc.orgId !== orgId) return res.status(404).json({ error: "Process not found or access denied" });

    const prompt = buildSuggestionPrompt({
      processTitle: proc.title,
      processDescription: proc.description ?? undefined,
      stepTitle: stepTitle ?? undefined,
      stepDescription: stepDescription ?? undefined,
      contextSnippets: contextSnippets ?? [],
    });

    const result = await generateSuggestionAndStore({ orgId, processId, stepId, prompt, metadata: { source: "api/ai/suggest" } });

    return res.json({ suggestionId: result.suggestionId, raw: result.raw, parsed: result.parsed, parseError: result.parseError });
  } catch (err: any) {
    console.error("AI suggestion error:", err);
    return res.status(500).json({ error: "AI provider error", detail: String(err) });
  } finally {
    clearRequestOrg();
  }
}
