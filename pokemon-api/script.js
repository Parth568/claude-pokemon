let input = document.getElementById("input-box");
let button = document.getElementById("submit-button");
let showContainer = document.getElementById("show-container");
let listContainer = document.querySelector(".list");

let pokemons = [];
const pokemonsReady = fetch("/pokemons.json")
  .then((r) => r.json())
  .then((data) => {
    pokemons = data;
  })
  .catch((err) => console.error("Failed to load pokemons.json:", err));

function displayWords(value) {
  input.value = value;
  removeElements();
}

function removeElements() {
  listContainer.innerHTML = "";
}

input.addEventListener("keyup", () => {
  removeElements();
  const q = input.value.trim().toLowerCase();
  if (q.length < 2) return;

  pokemons
    .filter((p) => p.name.toLowerCase().includes(q))
    .slice(0, 8)
    .forEach((pokemon) => {
      const name = pokemon.name;
      const div = document.createElement("div");
      div.style.cursor = "pointer";
      div.classList.add("autocomplete-items");
      div.addEventListener("click", () => {
        displayWords(name);
        getRsult();
      });
      let word = "<b>" + name.substr(0, q.length) + "</b>";
      word += name.substr(q.length);
      div.innerHTML = `<p class="item">${word}</p>`;
      listContainer.appendChild(div);
    });
});

const getRsult = async () => {
  if (input.value.trim().length < 1) {
    alert("Input cannot be blank");
    return;
  }
  removeElements();
  showContainer.innerHTML = "";

  await pokemonsReady;

  const query = input.value.trim().toLowerCase();
  const pokemon = pokemons.find((p) => p.name.toLowerCase() === query);

  if (!pokemon) {
    showContainer.innerHTML = `<p class="not-found">Pokemon "${input.value}" not found. Try another name!</p>`;
    return;
  }

  const typeBadges = pokemon.types
    .map((t) => `<span class="type-badge type-${t}">${t}</span>`)
    .join("");

  const abilitiesList = pokemon.abilities
    .map((a) => a.replace(/-/g, " "))
    .join(", ");

  const imgSrc =
    pokemon.thumbnail ||
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.pokeId}.png`;

  showContainer.innerHTML = `
    <div class="card-container">
      <div class="container-character-image">
        <img
          src="${imgSrc}"
          alt="${pokemon.name}"
          onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokeId}.png'"
        />
      </div>
      <div class="character-name">${pokemon.name}</div>
      <div class="pokemon-id">#${String(pokemon.pokeId).padStart(3, "0")}</div>
      <div class="pokemon-types">${typeBadges}</div>
      <div class="character-stats">
        <div class="stat">
          <div class="stat-label">Height</div>
          <div class="stat-value">${(pokemon.height / 10).toFixed(1)} m</div>
        </div>
        <div class="stat">
          <div class="stat-label">Weight</div>
          <div class="stat-value">${(pokemon.weight / 10).toFixed(1)} kg</div>
        </div>
        <div class="stat">
          <div class="stat-label">Base EXP</div>
          <div class="stat-value">${pokemon.baseExperience || "—"}</div>
        </div>
      </div>
      <div class="character-description">
        <span>Abilities:</span> ${abilitiesList}
      </div>
    </div>`;
};

button.addEventListener("click", getRsult);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") getRsult();
});

window.onload = () => {
  getRsult();
};
