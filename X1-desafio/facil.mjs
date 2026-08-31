import { createServer } from "node:http";

const libros = [
  {
    id: 1,
    titulo: "Cien años de soledad",
    autor: "Gabriel García Márquez",
    copias: 4,
  },
  {
    id: 2,
    titulo: "La casa de los espíritus",
    autor: "Isabel Allende",
    copias: 2,
  },
  {
    id: 3,
    titulo: "Ficciones",
    autor: "Jorge Luis Borges",
    copias: 3,
  },
];

createServer((peticion, respuesta) => {
  respuesta.writeHead(200, {
    "Content-Type": "application/json",
  });

  respuesta.end(JSON.stringify(libros));
}).listen(4003, () =>
  console.log("servidor con node:http en http://localhost:4003"),
);
