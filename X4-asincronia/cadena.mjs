async function json(url) {
  const respuesta = await fetch(url);
  return respuesta.json();
}

function nombresDeLaCadena(eslabon, acumulado = []) {
  acumulado.push(eslabon.species.name);
  for (const siguiente of eslabon.evolves_to)
    nombresDeLaCadena(siguiente, acumulado);
  return acumulado;
}

const inicial = process.argv[2] ?? "eevee";

console.time("dependientes, en serie");
const pokemon = await json(`https://pokeapi.co/api/v2/pokemon/${inicial}`);
const especie = await json(pokemon.species.url);
const cadena = await json(especie.evolution_chain.url);
console.timeEnd("dependientes, en serie");

const nombres = nombresDeLaCadena(cadena.chain);
console.log(
  "la familia de",
  inicial,
  "tiene",
  nombres.length,
  "miembros:",
  nombres.join(", "),
);

console.time("independientes, en paralelo");
const familia = await Promise.all(
  nombres.map((n) => json(`https://pokeapi.co/api/v2/pokemon/${n}`)),
);
console.timeEnd("independientes, en paralelo");

for (const p of familia)
  console.log(
    `${p.name.padEnd(10)} ${String(p.weight / 10).padStart(6)} kg  ${p.types.map((t) => t.type.name).join("/")}`,
  );
