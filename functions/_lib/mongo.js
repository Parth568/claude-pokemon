import { MongoClient } from "mongodb";

export async function withDb(env, fn) {
  const uri = (env.DB_CONNECTION_STRING || "").trim();
  if (!uri) {
    throw new Error("DB_CONNECTION_STRING is not set");
  }

  const dbName = (env.DB_NAME || "chaudhar007DB").trim();
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 8000,
  });

  try {
    await client.connect();
    return await fn(client.db(dbName));
  } finally {
    await client.close().catch(() => {});
  }
}

export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    status: init.status || 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=60",
      ...(init.headers || {}),
    },
  });
}

export function error(status, message) {
  return json({ error: message }, { status });
}
