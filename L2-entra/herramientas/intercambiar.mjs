import { readFileSync } from "node:fs";

// ── Rellena estos tres desde tu ficha ──────────────────────────────
const TOKEN_ENDPOINT = "https://biblotecanilo123.ciamlogin.com/a25de1fd-3e90-4ce1-b7d2-f892c8efae6a/oauth2/v2.0/token"; // tramo 6
const CLIENT_ID = "d24aa9f3-7ccd-4e3b-b254-b98f34dfef24"; // el de biblioteca-CLIENTE
const SCOPE_API = "api://94c98665-484c-4b8a-b404-4ec146ad9dee/libros.leer"; // api://.../libros.leer
// ───────────────────────────────────────────────────────────────────

const codigo = process.argv[2];
if (!codigo) {
  console.error("Uso: node herramientas/intercambiar.mjs <el-codigo>");
  process.exit(1);
}

// El secreto que generó login.mjs. Esto es lo que Entra va a verificar.
const verificador = readFileSync("datos/verificador.txt", "utf8").trim();

const cuerpo = new URLSearchParams({
  client_id: CLIENT_ID,
  grant_type: "authorization_code",
  code: codigo,
  redirect_uri: "http://localhost:4200/",
  code_verifier: verificador,
  scope: `openid ${SCOPE_API}`,
});

const respuesta = await fetch(TOKEN_ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: cuerpo,
});

const datos = await respuesta.json();

if (!respuesta.ok) {
  console.error("Entra rechazó el canje:\n");
  console.error(datos.error, "-", datos.error_description);
  process.exit(1);
}

console.log("ACCESS TOKEN (este es el que va al gateway):\n");
console.log(datos.access_token);
console.log("\nvence en", datos.expires_in, "segundos");
