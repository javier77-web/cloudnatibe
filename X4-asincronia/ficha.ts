import { obtenerPokemon, type Pokemon } from "./tipos.ts";

function describir(p: Pokemon): string {
  const tipos = p.types.map((t) => t.type.name).join("/");
  return `#${p.id} ${p.name}: ${p.height / 10} m, ${p.weight / 10} kg, tipo ${tipos}`;
}

const pikachu = await obtenerPokemon("pikachu");
console.log(describir(pikachu));
