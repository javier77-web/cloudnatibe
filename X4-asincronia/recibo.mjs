const p = fetch("https://pokeapi.co/api/v2/pokemon/pikachu");
console.log("1. lo que devuelve fetch:", p);

const respuesta = await p;
console.log("2. estado HTTP:", respuesta.status);

const pokemon = await respuesta.json();
console.log(
  "3. nombre:",
  pokemon.name,
  "| id:",
  pokemon.id,
  "| tipos:",
  pokemon.types.map((t) => t.type.name),
);
