const nombres = ["bulbasaur", "charmander", "squirtle"];

async function obtener(nombre) {
  const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`);
  return (await respuesta.json()).name;
}

nombres.forEach(async (nombre) => {
  console.log("llego", await obtener(nombre));
});
console.log("listo");
