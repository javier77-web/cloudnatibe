import { connect } from "node:net";

const puerto = process.argv[2];

const socket = connect(puerto, "localhost", () => {
  const peticion = [
    "GET /libros HTTP/1.1",
    `Host: localhost:${puerto}`,
    "Connection: close",
    "",
    "",
  ].join("\r\n");

  socket.write(peticion);
});

socket.on("data", (bytes) => {
  process.stdout.write(bytes.toString());
});

socket.on("end", () => {
  console.log("\n--- cerró la conexión ---");
});
