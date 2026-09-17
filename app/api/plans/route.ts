import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";
import { snapshot, MODEL_VERSION } from "../../../lib/model";
import { scenarioSchema } from "../../../lib/validation";
const json = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
function db() {
  if (!env.DB) throw new Error("Plan storage unavailable");
  return env.DB;
}
function sameOrigin(r: Request) {
  const origin = r.headers.get("origin");
  return !!origin && origin === new URL(r.url).origin;
}
export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return json({ error: "Sign in to view your saved plans." }, 401);
  try {
    const result = await db()
      .prepare(
        "SELECT id,name,scenario,created_at,updated_at FROM plans WHERE owner = ? ORDER BY updated_at DESC LIMIT 50",
      )
      .bind(user.userId)
      .all();
    return json({
      plans: result.results.map((r) => ({
        ...r,
        scenario:
          JSON.parse(String(r.scenario)).scenario ??
          JSON.parse(String(r.scenario)),
        modelVersion:
          JSON.parse(String(r.scenario)).modelVersion ?? MODEL_VERSION,
      })),
    });
  } catch (e) {
    console.error("plans.get", e);
    return json(
      {
        error:
          "Saved plans are temporarily unavailable. Your current work is still on screen.",
      },
      503,
    );
  }
}
export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return json({ error: "Sign in to save this plan." }, 401);
  if (!sameOrigin(request))
    return json({ error: "Request origin does not match." }, 403);
  try {
    const raw = await request.text();
    if (raw.length > 20000)
      return json({ error: "Plan exceeds the size limit." }, 413);
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return json({ error: "Invalid JSON." }, 400);
    }
    const parsed = scenarioSchema.safeParse(body);
    if (!parsed.success)
      return json({ error: "Invalid scenario. Check all input values." }, 400);
    const count = await db()
      .prepare("SELECT count(*) AS count FROM plans WHERE owner = ?")
      .bind(user.userId)
      .first<{ count: number }>();
    if ((count?.count ?? 0) >= 50)
      return json(
        {
          error:
            "You have 50 saved plans. Delete a plan before saving another.",
        },
        409,
      );
    const id = crypto.randomUUID(),
      now = new Date().toISOString();
    await db()
      .prepare(
        "INSERT INTO plans (id,owner,name,scenario,created_at,updated_at) VALUES (?,?,?,?,?,?)",
      )
      .bind(
        id,
        user.userId,
        parsed.data.name,
        JSON.stringify(snapshot(parsed.data)),
        now,
        now,
      )
      .run();
    return json({ id }, 201);
  } catch (e) {
    console.error("plans.save", e);
    return json(
      {
        error:
          "Could not save. Your inputs are preserved. Export a JSON backup or try again.",
      },
      503,
    );
  }
}
export async function DELETE(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return json({ error: "Sign in first." }, 401);
  if (!sameOrigin(request))
    return json({ error: "Request origin does not match." }, 403);
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !/^[a-f0-9-]{36}$/.test(id))
    return json({ error: "Invalid plan ID." }, 400);
  try {
    await db()
      .prepare("DELETE FROM plans WHERE id = ? AND owner = ?")
      .bind(id, user.userId)
      .run();
    return json({ ok: true });
  } catch (e) {
    console.error("plans.delete", e);
    return json({ error: "Could not delete this plan. Try again." }, 503);
  }
}
