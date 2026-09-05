const dormir = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

function conTimeout(promesa, ms) {
  const reloj = dormir(ms).then(() => {
    throw new Error(`se acabaron los ${ms} ms`);
  });
  return Promise.race([promesa, reloj]);
}

const limite = Number(process.argv[2] ?? 2000);
try {
  const respuesta = await conTimeout(
    fetch("https://pokeapi.co/api/v2/pokemon/mewtwo"),
    limite,
  );
  console.log("llego a tiempo:", respuesta.status);
} catch (e) {
  console.log("timeout:", e.message);
}
