const nombres = [
  "bulbasaur",
  "charmander",
  "squirtle",
  "pikachu",
  "eevee",
  "snorlax",
];

async function obtener(nombre) {
  const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`);
  const pokemon = await respuesta.json();
  return `${pokemon.name} pesa ${pokemon.weight / 10} kg`;
}

console.time("serie");
for (const nombre of nombres) {
  console.log(await obtener(nombre));
}
console.timeEnd("serie");
