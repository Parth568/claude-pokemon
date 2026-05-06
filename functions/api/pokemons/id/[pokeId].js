import { withDb, json, error } from "../../../_lib/mongo.js";

export async function onRequestGet({ params, env }) {
  try {
    const pokeId = parseInt(params.pokeId, 10);
    if (Number.isNaN(pokeId)) return error(400, "pokeId must be a number");

    return await withDb(env, async (db) => {
      const doc = await db
        .collection("pokemons")
        .findOne({ pokeId }, { projection: { _id: 0 } });
      if (!doc) return error(404, `Pokemon #${pokeId} not found`);
      return json(doc);
    });
  } catch (e) {
    return error(500, e.message);
  }
}
