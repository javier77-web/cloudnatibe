async function cargar() {
  console.log("1");
  const respuesta = await fetch("https://pokeapi.co/api/v2/pokemon/ditto");
  const pokemon = await respuesta.json();
  console.log("2", pokemon.name);
}

cargar();
console.log("3");
