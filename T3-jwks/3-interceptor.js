// T3 · archivo 3 de 3 — EL INTERCEPTOR
// El atacante. No tiene la llave privada, no tiene la clave de nadie: solo
// consiguió un token de un lector. Con eso intenta cinco cosas.
//
//     node 3-interceptor.js       (con los otros dos ya corriendo)
//
// Este archivo es tu lista de pruebas: te dice qué agujeros tiene el
// verificador. Un verificador correcto deja pasar SOLO el ataque 1.

const crypto = require("node:crypto");

const FIRMADOR = "http://localhost:4000";
const API = "http://localhost:4001";

const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
const abrir = (parte) => JSON.parse(Buffer.from(parte, "base64url").toString());

async function pedirToken(usuario, clave, aud) {
  const r = await fetch(`${FIRMADOR}/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ usuario, clave, aud }),
  });
  const { token, error } = await r.json();
  if (!token) throw new Error(error);
  return token;
}

let agujeros = 0;

async function probar(nombre, token, ruta, esperado) {
  const r = await fetch(`${API}${ruta}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const cuerpo = await r.json();
  const bien = r.status === esperado;
  if (!bien) agujeros++;
  console.log(`\n${bien ? "✅" : "🚨"} ${nombre}`);
  console.log(`   GET ${ruta} → ${r.status} (esperado: ${esperado})`);
  console.log(`   ${JSON.stringify(cuerpo)}`);
  if (!bien)
    console.log(
      `   AGUJERO ABIERTO — el verificador debería haber respondido ${esperado}`,
    );
}

(async () => {
  // ── 0 · La captura ───────────────────────────────────────────────────────
  // En L1 viste con Wireshark que el token viaja en texto plano sobre HTTP.
  // Damos eso por hecho: el atacante ya tiene el token de `luis`, un lector.
  const robado = await pedirToken("luis", "1234");
  const [h, p, s] = robado.split(".");

  console.log("═══ TOKEN INTERCEPTADO ═══");
  console.log(robado.slice(0, 60) + "…\n");

  // ── 1 · Leerlo. Sin ninguna llave. ───────────────────────────────────────
  console.log("header :", JSON.stringify(abrir(h)));
  console.log("payload:", JSON.stringify(abrir(p)));
  console.log("\nNo usé ninguna llave para leer eso. base64url no es cifrado.");

  // ── ATAQUE 1 · Reenvío tal cual ──────────────────────────────────────────
  // El token no dice quién lo presenta. Si lo tengo, soy luis.
  await probar(
    "ATAQUE 1 · reenviar el token robado tal cual",
    robado,
    "/prestamos",
    200,
  );

  // ── ATAQUE 2 · Subir de rol editando el payload ──────────────────────────
  // Cambio rol a bibliotecario y pego la firma ORIGINAL sin tocarla.
  const editado = abrir(p);
  editado.rol = "bibliotecario";
  await probar(
    "ATAQUE 2 · editar el payload y conservar la firma",
    `${h}.${b64(editado)}.${s}`,
    "/devoluciones",
    401,
  );

  // ── ATAQUE 3 · alg: none ─────────────────────────────────────────────────
  // Me invento el token completo y declaro que no va firmado.
  const sinFirma = `${b64({ alg: "none", typ: "JWT" })}.${b64({ ...editado })}.`;
  await probar(
    "ATAQUE 3 · alg:none, token forjado sin firma",
    sinFirma,
    "/devoluciones",
    401,
  );

  // ── ATAQUE 4 · Token legítimo, aplicación equivocada ─────────────────────
  // Firma impecable, mismo emisor, `exp` vigente. Pero fue emitido para otra
  // API. Este es el que se cuela en producción de verdad.
  const deOtraApp = await pedirToken("ana", "1234", "api-pagos");
  console.log(
    "\n   (token de api-pagos:",
    JSON.stringify(abrir(deOtraApp.split(".")[1])),
    ")",
  );
  await probar(
    "ATAQUE 4 · token válido pero emitido para otra aplicación",
    deOtraApp,
    "/devoluciones",
    401,
  );

  // ── ATAQUE 5 · TODO (desafío 3, opcional) ────────────────────────────────
  // Genero MI par de llaves, firmo un token con rol bibliotecario y le pongo
  // el `kid` real del firmador, para que el verificador crea que es suyo.
  // Prográmalo tú. Pistas: crypto.generateKeyPairSync y crypto.createSign,
  // igual que en el archivo 1. El `kid` real lo sacas del JWKS o del header
  // del token robado.

  console.log(`\n═══ RESUMEN ═══`);
  console.log(
    agujeros === 0
      ? "Ningún agujero. Solo pasó el ataque 1 — y ese no se arregla verificando:\nse arregla con HTTPS y con un `exp` corto."
      : `${agujeros} agujero(s) abierto(s) en el verificador. Ve los TODO del archivo 2.`,
  );
})().catch((e) => {
  console.error(`\nFalló: ${e.message}`);
  console.error(
    "¿Están corriendo 1-firmador.js (4000) y 2-verificador.js (4001)?",
  );
  process.exit(1);
});
