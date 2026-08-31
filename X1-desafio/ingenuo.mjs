const aB64 = (objeto) =>
  Buffer.from(JSON.stringify(objeto)).toString("base64url");

const deB64 = (texto) => JSON.parse(Buffer.from(texto, "base64url").toString());

function verificarIngenuo(token) {
  const [h, p, firma] = token.split(".");

  const header = deB64(h);
  const payload = deB64(p);

  if (header.alg === "none") {
    return {
      valido: true,
      payload,
    };
  }

  return {
    valido: false,
    motivo: "Algoritmo no permitido",
  };
}

// Token forjado
const header = {
  alg: "none",
  typ: "JWT",
};

const payload = {
  sub: "lectora-001",
  roles: ["bibliotecario"],
};

const h = aB64(header);
const p = aB64(payload);

// La firma está vacía
const tokenForjado = `${h}.${p}.`;

console.log("TOKEN FORJADO:");
console.log(tokenForjado);

console.log("\nVERIFICACIÓN:");
console.log(verificarIngenuo(tokenForjado));
