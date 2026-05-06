import { withDb, json, error } from "../../_lib/mongo.js";

export async function onRequestGet({ params, env }) {
  try {
    const name = String(params.name || "").toLowerCase();
    return await withDb(env, async (db) => {
      const doc = await db
        .collection("pokemons")
        .findOne({ name }, { projection: { _id: 0 } });
      if (!doc) return error(404, `Pokemon "${name}" not found`);
      return json(doc);
    });
  } catch (e) {
    return error(500, e.message);
  }
}
