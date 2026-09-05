import { Worker, isMainThread, parentPort } from "node:worker_threads";

function contar() {
  let x = 0;
  for (let i = 0; i < 1_000_000_000; i++) x += i;
  return x;
}

if (isMainThread) {
  const enHilo = () =>
    new Promise((resolver) => {
      const w = new Worker(new URL(import.meta.url));
      w.once("message", resolver);
    });

  console.time("dos en hilos de verdad");
  await Promise.all([enHilo(), enHilo()]);
  console.timeEnd("dos en hilos de verdad");
} else {
  parentPort.postMessage(contar());
}
