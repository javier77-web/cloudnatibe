const token = process.argv[2];
if (!token) {
  console.error("Uso: node herramientas/ver-token.mjs <token>");
  process.exit(1);
}

const partes = token.split(".");
console.log("El token tiene", partes.length, "partes.\n");

const aObjeto = (parte) =>
  JSON.parse(Buffer.from(parte, "base64url").toString());

console.log("CABECERA:");
console.log(aObjeto(partes[0]));

const carga = aObjeto(partes[1]);
console.log("\nCARGA:");
console.log(carga);

console.log("\nVence el", new Date(carga.exp * 1000).toLocaleString());
console.log("Firma (tercera parte), sin tocar:");
console.log(partes[2].slice(0, 40) + "…");
