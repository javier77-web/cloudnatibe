export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: { slot: number; type: { name: string; url: string } }[];
}

export async function obtenerPokemon(nombre: string): Promise<Pokemon> {
  const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`);
  if (!respuesta.ok) throw new Error(`${nombre}: HTTP ${respuesta.status}`);
  return respuesta.json() as Promise<Pokemon>;
}