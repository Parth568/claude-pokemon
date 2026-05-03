import fetch from "node-fetch";
import fs from "fs";

const baseURL = "https://pokeapi.co/api/v2/pokemon";
const LIMIT = 151; // Gen 1 — increase for more (e.g. 1025 for all)

async function fetchPokemons() {
  console.log("Fetching Pokemon list...");

  // Step 1: get the list of pokemon names + urls
  const listRes = await fetch(`${baseURL}?limit=${LIMIT}&offset=0`);
  const listData = await listRes.json();

  if (!listData.results) {
    console.error("❌ Unexpected response from PokeAPI:", listData);
    process.exit(1);
  }

  console.log(`Found ${listData.results.length} Pokemon. Fetching details...`);

  const allPokemons = [];

  // Step 2: fetch each pokemon's detail page
  for (let i = 0; i < listData.results.length; i++) {
    const { url } = listData.results[i];
    const detailRes = await fetch(url);
    const detail = await detailRes.json();

    const pokemon = {
      pokeId: detail.id,
      name: detail.name,
      height: detail.height,
      weight: detail.weight,
      baseExperience: detail.base_experience,
      types: detail.types.map((t) => t.type.name),
      abilities: detail.abilities.map((a) => a.ability.name),
      thumbnail:
        detail.sprites.other["official-artwork"].front_default ||
        detail.sprites.front_default,
    };

    allPokemons.push(pokemon);
    console.log(`✅ [${i + 1}/${listData.results.length}] ${pokemon.name}`);
  }

  // Step 3: save directly to the file Vite serves
  const outPath = "../pokemon-api/public/pokemons.json";
  fs.writeFileSync(outPath, JSON.stringify(allPokemons, null, 2));
  console.log(`\n✅ Saved ${allPokemons.length} pokemons to ${outPath}`);
}

fetchPokemons().catch(console.error);
