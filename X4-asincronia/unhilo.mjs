async function contar(etiqueta) {
  let x = 0;
  for (let i = 0; i < 1_000_000_000; i++) x += i;
  return `${etiqueta} termino`;
}

console.time("uno solo");
await contar("a");
console.timeEnd("uno solo");

console.time('dos "en paralelo"');
await Promise.all([contar("a"), contar("b")]);
console.timeEnd('dos "en paralelo"');
