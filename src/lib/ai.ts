import { OpenAI } from "openai";
import prisma from "./prisma";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const DEFAULT_TEMPERATURE = Number(process.env.OPENAI_TEMP ?? 0.2);
const DEFAULT_MAX_TOKENS = Number(process.env.OPENAI_MAX_TOKENS ?? 800);

export function buildSuggestionPrompt({
  processTitle,
  processDescription,
  stepTitle,
  stepDescription,
  contextSnippets = [],
}: {
  processTitle?: string;
  processDescription?: string;
  stepTitle?: string;
  stepDescription?: string;
  contextSnippets?: string[];
}) {
  const header = [
    `You are a process design assistant. Produce a concise suggestion for a process step or list of recommended RACI roles and risk flags.`,
    `Return a JSON object with keys: \"suggested_text\", \"raci_recommendations\" (array of {role,subject_hint}), and \"risk_flags\" (array of string).`,
    "Include brief justification in 'reasoning' and list any source ids used in 'sources' when available.",
  ].join("\n\n");

  const processPart = processTitle ? `Process: ${processTitle}\n${processDescription ?? ""}` : "";
  const stepPart = stepTitle ? `Target step: ${stepTitle}\n${stepDescription ?? ""}` : "";

  const contexts = contextSnippets.length
    ? `Context snippets (most relevant first):\n- ${contextSnippets.join("\n- ")}`
    : "No additional context available.";

  const prompt = [header, processPart, stepPart, contexts, "Produce only valid JSON."].join("\n\n");
  return prompt;
}

export async function generateSuggestionAndStore({
  orgId,
  processId,
  stepId,
  prompt,
  metadata = {},
}: {
  orgId?: string;
  processId?: string;
  stepId?: string;
  prompt: string;
  metadata?: Record<string, any>;
}) {
  const model = DEFAULT_MODEL;
  const temperature = DEFAULT_TEMPERATURE;
  const max_tokens = DEFAULT_MAX_TOKENS;

  const messages = [
    { role: "system", content: "You are a helpful assistant for drafting SOP steps and RACI assignments." },
    { role: "user", content: prompt },
  ];

  const resp = await client.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens,
  });

  const rawText = resp.choices?.[0]?.message?.content ?? (Array.isArray(resp.choices) && resp.choices[0]?.text) ?? String(resp);

  const rec = await prisma.aiSuggestion.create({
    data: {
      processId: processId ?? null,
      stepId: stepId ?? null,
      prompt,
      response: rawText,
      modelMeta: {
        provider: "openai",
        model,
        temperature,
        max_tokens,
        response_id: resp.id ?? null,
        ...metadata,
      },
    },
  });

  let parsed = null;
  let parseError = null;
  try {
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch (err) {
    parseError = String(err);
  }

  return { suggestionId: rec.id, raw: rawText, parsed, parseError };
}
