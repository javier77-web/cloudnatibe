const dormir = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

async function lento(nombre, ms) {
  await dormir(ms);
  const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`);
  return (await respuesta.json()).name;
}

console.time("tres en paralelo");
await Promise.all([
  lento("pikachu", 200),
  lento("eevee", 150),
  lento("snorlax", 1500),
]);
console.timeEnd("tres en paralelo");
