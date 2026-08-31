import { createServer } from "node:net";

const defecto = process.argv[2];

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
      {
        id: 3,
        titulo: "Ficciones",
        autor: "Jorge Luis Borges",
        copias: 3,
      },
    ];

    const peticion = bytes.toString();

    const primeraLinea = peticion.split("\r\n")[0];
    const [metodo, ruta] = primeraLinea.split(" ");

    console.log("Método:", metodo);
    console.log("Ruta:", ruta);
    console.log("Defecto:", defecto);

    const respuestaBody = JSON.stringify({
      mensaje: "hola mundo",
      libros,
      metodo,
      ruta,
    });

    const largoCorrecto = Buffer.byteLength(respuestaBody, "utf8");

    let respuesta;

    if (defecto === "corto") {
      respuesta = [
        "HTTP/1.1 200 OK",
        "Content-Type: application/json; charset=utf-8",
        "Content-Length: 5",
        "Connection: close",
        "",
        respuestaBody,
      ].join("\r\n");

      socket.write(respuesta);
      socket.end();
    } else if (defecto === "largo") {
      respuesta = [
        "HTTP/1.1 200 OK",
        "Content-Type: application/json; charset=utf-8",
        "Content-Length: 9999",
        "Connection: close",
        "",
        respuestaBody,
      ].join("\r\n");

      socket.write(respuesta);
      socket.end();
    } else if (defecto === "sinlinea") {
      respuesta = [
        "HTTP/1.1 200 OK",
        "Content-Type: application/json; charset=utf-8",
        `Content-Length: ${largoCorrecto}`,
        "Connection: close",
        respuestaBody,
      ].join("\r\n");

      socket.write(respuesta);
      socket.end();
    } else if (defecto === "sinlargo") {
      respuesta = [
        "HTTP/1.1 200 OK",
        "Content-Type: application/json; charset=utf-8",
        "Connection: close",
        "",
        respuestaBody,
      ].join("\r\n");

      socket.write(respuesta);

      // No cerramos la conexión
    } else {
      respuesta = [
        "HTTP/1.1 200 OK",
        "Content-Type: application/json; charset=utf-8",
        `Content-Length: ${largoCorrecto}`,
        "Connection: close",
        "",
        respuestaBody,
      ].join("\r\n");

      socket.write(respuesta);
      socket.end();
    }
  });
}).listen(4002, () => {
  console.log("escuchando en http://localhost:4002");
  console.log("Defecto:", defecto);
});
