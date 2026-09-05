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

console.time("paralelo");
const resultados = await Promise.all(nombres.map((nombre) => obtener(nombre)));
for (const linea of resultados) console.log(linea);
console.timeEnd("paralelo");
