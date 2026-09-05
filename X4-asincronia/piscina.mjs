async function json(url) {
  const respuesta = await fetch(url);
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status} en ${url}`);
  return respuesta.json();
}

// Ejecuta las tareas (funciones que devuelven una promesa) con a lo mas `limite` en vuelo.
async function enPiscina(tareas, limite) {
  const resultados = new Array(tareas.length);
  let siguiente = 0;

  async function trabajador() {
    while (siguiente < tareas.length) {
      const i = siguiente++;
      resultados[i] = await tareas[i]();
    }
  }

  await Promise.all(Array.from({ length: limite }, trabajador));
  return resultados;
}

const limite = Number(process.argv[2] ?? 5);
const lista = await json("https://pokeapi.co/api/v2/pokemon?limit=151");
const tareas = lista.results.map((r) => () => json(r.url));

console.time(`151 pokemon con limite ${limite}`);
const pokemons = await enPiscina(tareas, limite);
console.timeEnd(`151 pokemon con limite ${limite}`);

const masPesado = pokemons.reduce((a, b) => (b.weight > a.weight ? b : a));
console.log(
  "el mas pesado de los 151 es",
  masPesado.name,
  "con",
  masPesado.weight / 10,
  "kg",
);
