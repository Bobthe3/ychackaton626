// POST /api/decode — streaming chat about the clip on screen. The assistant
// opens by narrating, in plain language, what the model learned about the clip,
// then answers follow-up questions. A minimal tool-use loop grounds it: the
// model can call get_clip_characteristics to read the clip's real analyzed
// features. Text streams back token-by-token.
//
// Chat Completions (not the realtime socket) so image input can be added later —
// attach an { type: "image_url", ... } part to a user message.
//
// The OpenAI key stays server-side. Set it in frontend/.env.local:
//   OPENAI_API_KEY=sk-...   (OPENAI_MODEL optional)
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";

const SYSTEM = [
  "You are NeuroViral's neuro-marketing analyst, embedded next to a short-form clip the user is watching.",
  "On the first turn, narrate in 2-3 short, plain-language sentences what the model LEARNED about this clip",
  "from its content and why it likely holds or loses attention. After that, answer the user's follow-up",
  "questions conversationally and concisely.",
  "A FALLING theta/beta ratio means RISING engagement, so a fast hook, tight cuts, burned-in captions and",
  "on-screen text that sustain attention matter.",
  "Call get_clip_characteristics whenever you need the clip's real, analyzed numbers — always ground claims",
  "in them. Be specific and concrete; no preamble, no bullet lists unless asked.",
].join(" ");

interface ClipCtx {
  characteristics?: {
    audio?: string;
    transcript_summary?: string;
    cut_count?: number;
    on_screen_text?: string;
    subtitles?: boolean;
  };
  creator?: string;
  duration_ms?: number;
  peak_t?: number | null;
  learnedTraits?: string[];
}
interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}
interface Body {
  clip?: ClipCtx;
  messages?: ChatTurn[];
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response("OPENAI_API_KEY not set — add it to frontend/.env.local", { status: 503 });
  }
  const body = (await req.json().catch(() => ({}))) as Body;
  const clip = body.clip ?? {};
  const c = clip.characteristics ?? {};
  const history = Array.isArray(body.messages) ? body.messages : [];

  // the tool output: the clip's real analyzed characteristics
  const facts = {
    summary: c.transcript_summary ?? "",
    creator: clip.creator ?? "",
    duration_s: clip.duration_ms ? Math.round(clip.duration_ms / 1000) : undefined,
    cut_count: c.cut_count ?? 0,
    audio: c.audio ?? "",
    on_screen_text: c.on_screen_text ?? "",
    subtitles: c.subtitles ?? false,
    model_predicted_peak_interest_at_s: clip.peak_t ?? undefined,
    learned_traits: clip.learnedTraits ?? [],
  };

  const client = new OpenAI({ apiKey });
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [{ role: "system", content: SYSTEM }];
  if (history.length === 0) {
    messages.push({
      role: "user",
      content: "Decode the clip currently on screen: what did the model learn, and why does it hold or lose attention?",
    });
  } else {
    for (const m of history) messages.push({ role: m.role, content: m.content });
  }

  const tools: OpenAI.Chat.ChatCompletionTool[] = [
    {
      type: "function",
      function: {
        name: "get_clip_characteristics",
        description: "Return the analyzed content characteristics of the clip currently on screen.",
        parameters: { type: "object", properties: {}, additionalProperties: false },
      },
    },
  ];

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();
      const push = (s: string) => controller.enqueue(enc.encode(s));
      try {
        for (let hop = 0; hop < 4; hop++) {
          const completion = await client.chat.completions.create({
            model: MODEL,
            messages,
            tools,
            tool_choice: "auto",
            stream: true,
          });
          let content = "";
          const calls: { id: string; name: string; args: string }[] = [];
          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta;
            if (delta?.content) {
              content += delta.content;
              push(delta.content);
            }
            for (const tc of delta?.tool_calls ?? []) {
              const i = tc.index ?? 0;
              calls[i] = calls[i] ?? { id: "", name: "", args: "" };
              if (tc.id) calls[i].id = tc.id;
              if (tc.function?.name) calls[i].name += tc.function.name;
              if (tc.function?.arguments) calls[i].args += tc.function.arguments;
            }
          }
          if (calls.length === 0) break; // model produced its final answer
          messages.push({
            role: "assistant",
            content: content || null,
            tool_calls: calls.map((tc) => ({
              id: tc.id,
              type: "function",
              function: { name: tc.name, arguments: tc.args || "{}" },
            })),
          });
          for (const call of calls) {
            const out = call.name === "get_clip_characteristics" ? facts : { error: "unknown tool" };
            messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(out) });
          }
        }
        controller.close();
      } catch (err) {
        try { push(fallbackDecode(facts)); } catch { /* closed */ }
        try { controller.close(); } catch { /* closed */ }
      }
    },
  });

  return new Response(stream, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}

function fallbackDecode(facts: {
  summary: string;
  creator: string;
  duration_s?: number;
  cut_count: number;
  audio: string;
  on_screen_text: string;
  subtitles: boolean;
  model_predicted_peak_interest_at_s?: number;
}) {
  const peak = facts.model_predicted_peak_interest_at_s != null
    ? `${facts.model_predicted_peak_interest_at_s.toFixed(1)}s`
    : "the opening seconds";
  return [
    `${facts.summary || "This clip"} has the ingredients the model usually rewards: a fast hook, ${facts.cut_count} cuts, ${facts.subtitles ? "captions" : "sparse captions"}, and visible text "${facts.on_screen_text}".`,
    `The predicted attention peak is around ${peak}, so the opening has to land before the viewer scrolls.`,
  ].join(" ");
}
