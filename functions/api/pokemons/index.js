import { withDb, json, error } from "../../_lib/mongo.js";

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") || "").trim().toLowerCase();
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "200", 10), 1025);

    return await withDb(env, async (db) => {
      const filter = q ? { name: { $regex: q, $options: "i" } } : {};
      const docs = await db
        .collection("pokemons")
        .find(filter, { projection: { _id: 0 } })
        .sort({ pokeId: 1 })
        .limit(limit)
        .toArray();
      return json(docs);
    });
  } catch (e) {
    return error(500, e.message);
  }
}
