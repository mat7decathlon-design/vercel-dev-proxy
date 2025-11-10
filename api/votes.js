export default async function handler(req, res) {
  const API_KEY = process.env.PROXY_API_KEY || "";
  if (API_KEY && req.headers["x-api-key"] !== API_KEY) {
    return res.status(401).json({ error: "missing/invalid api key" });
  }

  const universeId = req.query.universeId || "90404826372262";
  if (!universeId) return res.status(400).json({ error: "Missing universeId" });

  const ALLOWED = (process.env.ALLOWED_HOSTS || "games.roblox.com")
    .split(",")
    .map(s => s.trim().toLowerCase());

  const target = `https://games.roblox.com/v1/games/votes?universeIds=${encodeURIComponent(universeId)}`;

  try {
    const u = new URL(target);
    const host = u.hostname.toLowerCase();
    if (!ALLOWED.some(a => a === host || host.endsWith("." + a))) {
      return res.status(403).json({ error: "target host not allowed" });
    }
  } catch (e) {
    return res.status(400).json({ error: "invalid target url" });
  }

  try {
    const r = await fetch(target, {
      headers: { "User-Agent": "vercel-proxy/1.0", Accept: "application/json" },
      redirect: "follow"
    });

    if (!r.ok) {
      return res.status(r.status).json({ error: `Upstream ${r.status}` });
    }

    const json = await r.json();
    const upVotes = json?.data?.[0]?.upVotes ?? null;
    return res.status(200).json({ upVotes, upstream: target });
  } catch (err) {
    console.error("Fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch upstream" });
  }
}
