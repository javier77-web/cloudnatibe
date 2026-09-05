import { obtenerPokemon, type Pokemon } from "./tipos.ts";

const pikachu: Pokemon = obtenerPokemon("pikachu"); // error 1
const alto: string = pikachu.height; // error 2
console.log(pikachu.nombre, alto); // error 3
