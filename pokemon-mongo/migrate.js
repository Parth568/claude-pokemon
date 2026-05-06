import "dotenv/config";
import { MongoClient } from "mongodb";

const SOURCE_URI =
  process.env.SOURCE_DB_CONNECTION_STRING ||
  "mongodb://172.20.10.7:21317";
const SOURCE_DB = process.env.SOURCE_DB_NAME || "chaudhar007DB";
const TARGET_URI = process.env.DB_CONNECTION_STRING;
const TARGET_DB = process.env.DB_NAME || "chaudhar007DB";
const COLLECTION = "pokemons";

if (!TARGET_URI) {
  console.error("DB_CONNECTION_STRING is not set in .env");
  process.exit(1);
}

async function migrate() {
  const source = new MongoClient(SOURCE_URI, { serverSelectionTimeoutMS: 5000 });
  const target = new MongoClient(TARGET_URI, { serverSelectionTimeoutMS: 10000 });

  console.log(`Source: ${SOURCE_DB}.${COLLECTION} @ ${redact(SOURCE_URI)}`);
  console.log(`Target: ${TARGET_DB}.${COLLECTION} @ ${redact(TARGET_URI)}`);

  try {
    await source.connect();
    await source.db(SOURCE_DB).command({ ping: 1 });
    console.log("✓ source connected");
  } catch (e) {
    console.error("✗ source connection failed:", e.codeName || e.message);
    throw e;
  }

  try {
    await target.connect();
    await target.db(TARGET_DB).command({ ping: 1 });
    console.log("✓ target connected");
  } catch (e) {
    console.error("✗ target connection failed:", e.codeName || e.message);
    throw e;
  }

  const docs = await source.db(SOURCE_DB).collection(COLLECTION).find({}).toArray();
  console.log(`Read ${docs.length} documents from source`);

  if (docs.length === 0) {
    console.warn("Nothing to migrate. Bailing out.");
    await source.close();
    await target.close();
    return;
  }

  const targetColl = target.db(TARGET_DB).collection(COLLECTION);
  await targetColl.deleteMany({});
  await targetColl.insertMany(docs.map(({ _id, ...rest }) => rest));
  await targetColl.createIndex({ name: 1 }, { unique: true });
  await targetColl.createIndex({ pokeId: 1 }, { unique: true });

  const count = await targetColl.countDocuments();
  console.log(`Wrote ${count} documents to target`);

  await source.close();
  await target.close();
}

function redact(uri) {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
