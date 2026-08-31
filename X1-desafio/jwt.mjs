import { createHmac, timingSafeEqual } from "node:crypto";

const CLAVE = "clave-secreta-biblioteca";

const aB64 = (objeto) =>
  Buffer.from(JSON.stringify(objeto)).toString("base64url");

const deB64 = (texto) => JSON.parse(Buffer.from(texto, "base64url").toString());

const firmar = (h, p) =>
  createHmac("sha256", CLAVE).update(`${h}.${p}`).digest("base64url");

function emitir(payload) {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const h = aB64(header);
  const p = aB64(payload);
  const firma = firmar(h, p);

  return `${h}.${p}.${firma}`;
}

function verificar(token) {
  const partes = token.split(".");

  if (partes.length !== 3) {
    return {
      valido: false,
      motivo: "El token no tiene tres partes",
    };
  }

  const [h, p, firmaRecibida] = partes;

  let header;
  let payload;

  try {
    header = deB64(h);
    payload = deB64(p);
  } catch {
    return {
      valido: false,
      motivo: "Header o payload inválido",
    };
  }

  const firmaEsperada = firmar(h, p);

  const recibidaBuffer = Buffer.from(firmaRecibida);
  const esperadaBuffer = Buffer.from(firmaEsperada);

  if (recibidaBuffer.length !== esperadaBuffer.length) {
    return {
      valido: false,
      motivo: "Firma inválida",
    };
  }

  if (!timingSafeEqual(recibidaBuffer, esperadaBuffer)) {
    return {
      valido: false,
      motivo: "Firma inválida",
    };
  }

  return {
    valido: true,
    payload,
  };
}

// 1. Emitir
const payload = {
  sub: "lectora-001",
  roles: ["lectora"],
};

const token = emitir(payload);

console.log("TOKEN ORIGINAL:");
console.log(token);

// 2. Verificar
console.log("\nVERIFICACIÓN ORIGINAL:");
console.log(verificar(token));

// 3. Falsificar
const partes = token.split(".");
const payloadFalso = deB64(partes[1]);

payloadFalso.roles = ["bibliotecario"];

const payloadFalsoB64 = aB64(payloadFalso);

// Conservamos la firma original
const tokenFalso = `${partes[0]}.${payloadFalsoB64}.${partes[2]}`;

console.log("\nTOKEN FALSIFICADO:");
console.log(tokenFalso);

// 4. Verificar falsificación
console.log("\nVERIFICACIÓN FALSIFICACIÓN:");
console.log(verificar(tokenFalso));
