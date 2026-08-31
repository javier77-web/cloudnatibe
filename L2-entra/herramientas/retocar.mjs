const [token, modo] = process.argv.slice(2);

if (!token || !["vencido", "otro-usuario"].includes(modo)) {
  console.error(
    "Uso: node herramientas/retocar.mjs <token> vencido|otro-usuario",
  );
  process.exit(1);
}

const [cabecera, carga, firma] = token.split(".");
const datos = JSON.parse(Buffer.from(carga, "base64url").toString());

if (modo === "vencido") {
  datos.exp = Math.floor(Date.now() / 1000) - 60; // venció hace un minuto
} else {
  datos.sub = "director-de-la-biblioteca";
  datos.name = "Quien Yo Quiera";
}

const cargaNueva = Buffer.from(JSON.stringify(datos)).toString("base64url");

// La firma se deja tal cual: es la vieja, y ya no corresponde a esta carga.
console.log(`${cabecera}.${cargaNueva}.${firma}`);
