import { createServer } from "node:net";

createServer((socket) => {
  socket.on("data", (bytes) => {
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
      { id: 3, titulo: "Ficciones", autor: "Jorge Luis Borges", copias: 3 },
    ];

    const peticion = bytes.toString();
    // …lee la primera línea, arma la respuesta…
    // Aquí lees la primera línea de la petición HTTP
    const primeraLinea = peticion.split("\r\n")[0];

    // Ejemplo: "GET / HTTP/1.1"
    const [metodo, ruta] = primeraLinea.split(" ");
    console.log("Método:", metodo);
    console.log("Ruta:", ruta);

    const respuestaBody = JSON.stringify({
      mensaje: "Hola mundo",
      libros,
      metodo,
      ruta,
    });

    const respuesta = [
      "HTTP/1.1 200 OK",
      "Content-Type: application/json; charset=utf-8",
      `Content-Length: ${Buffer.byteLength(respuestaBody, "utf8")}`,
      "Connection: close",
      "",
      respuestaBody,
    ].join("\r\n");

    socket.write(respuesta);
    socket.end();
  });
}).listen(4001, () => console.log("escuchando en http://localhost:4001"));
