async function obtener(nombre) {
  const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`);
  if (!respuesta.ok) throw new Error(`${nombre}: HTTP ${respuesta.status}`);
  const pokemon = await respuesta.json();
  return `${pokemon.name} (#${pokemon.id})`;
}

const nombres = ["pikachu", "agumon", "eevee"];

console.log("--- Promise.all ---");
try {
  const todos = await Promise.all(nombres.map(obtener));
  console.log(todos);
} catch (e) {
  console.log("todo se perdio por uno:", e.message);
}

console.log("--- Promise.allSettled ---");
const resultados = await Promise.allSettled(nombres.map(obtener));
for (const r of resultados) {
  if (r.status === "fulfilled") console.log("ok      ", r.value);
  else console.log("fallo   ", r.reason.message);
}
