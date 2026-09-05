async function obtener(nombre) {
  const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`);
  if (!respuesta.ok) throw new Error(`${nombre}: HTTP ${respuesta.status}`);
  return respuesta.json();
}

try {
  await obtener("agumon"); // <- sin await
  console.log("confirmado: el pokemon existe");
} catch (e) {
  console.log("atrapado:", e.message);
}
console.log("fin del programa");
